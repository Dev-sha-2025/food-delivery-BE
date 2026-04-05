import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} from '@phonepe-pg/pg-sdk-node';
import { CallbackType } from '@phonepe-pg/pg-sdk-node/dist/common/models/response/CallbackType';

@Injectable()
export class PhonePeService implements OnModuleInit {
  private client: StandardCheckoutClient;

  private readonly clientId = process.env.PHONEPE_CLIENT_ID;
  private readonly clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  private readonly webhookUser = process.env.PHONEPE_WEBHOOK_USER;
  private readonly webhookPass = process.env.PHONEPE_WEBHOOK_PASS;

  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<any>,
    @InjectModel('Order') private readonly orderModel: Model<any>,
  ) {}

  onModuleInit() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET environment variables must be set',
      );
    }

    const env =
      process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.SANDBOX;

    this.client = StandardCheckoutClient.getInstance(
      this.clientId,
      this.clientSecret,
      1,
      env,
    );
  }

  // A. Initiate Payment — creates a PENDING transaction record
  async initiatePayment(orderId: string, amount: number) {
    const amountInPaise = amount * 100;

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(orderId)
      .amount(amountInPaise)
      .redirectUrl(
        `https://your-frontend.com/payment-status?orderId=${orderId}`,
      )
      .build();

    const response = await this.client.pay(request);

    await this.transactionModel.findOneAndUpdate(
      { orderId },
      {
        $set: {
          orderId,
          amount,
          amountInPaise,
          status: 'PENDING',
          redirectUrl: response.redirectUrl ?? null,
        },
      },
      { upsert: true, new: true },
    );

    return response.redirectUrl;
  }

  // B. Verify Webhook Callback
  //    1. Validate signature
  //    2. Call checkStatus for authoritative data from PhonePe
  //    3. Persist transaction + order with full paymentDetails
  async verifyWebhook(authHeader: string, rawBody: string) {
    if (!this.webhookUser || !this.webhookPass) {
      throw new InternalServerErrorException(
        'PHONEPE_WEBHOOK_USER and PHONEPE_WEBHOOK_PASS environment variables must be set',
      );
    }

    try {
      // Step 1: Validate webhook signature
      const callbackResponse = this.client.validateCallback(
        this.webhookUser,
        this.webhookPass,
        authHeader,
        rawBody,
      );

      const { type, payload } = callbackResponse;

      // merchantOrderId is the key we use to query PhonePe
      const merchantOrderId =
        payload?.merchantOrderId || payload?.orderId;

      // Step 2: Call checkStatus to get authoritative data from PhonePe
      let authoritative: any = null;
      if (merchantOrderId) {
        try {
          authoritative = await this.client.getOrderStatus(merchantOrderId);
        } catch {
          // fall back to webhook payload if status API fails
        }
      }

      // Step 3: Resolve final status — prefer checkStatus response
      const finalState: string =
        authoritative?.state ?? payload?.state ?? 'PENDING';

      const paymentDetails =
        authoritative?.paymentDetails ?? payload?.paymentDetails ?? [];

      const transactionId =
        paymentDetails?.[0]?.transactionId || null;

      const paymentMode =
        paymentDetails?.[0]?.paymentMode || null;

      const errorCode =
        authoritative?.errorCode ?? payload?.errorCode ?? null;

      // Map CallbackType to a normalised status string
      let status: string;
      let isPaymentSuccess: boolean;

      if (
        type === CallbackType.CHECKOUT_ORDER_COMPLETED ||
        type === CallbackType.PG_ORDER_COMPLETED
      ) {
        status = 'COMPLETED';
        isPaymentSuccess = true;
      } else if (
        type === CallbackType.CHECKOUT_ORDER_FAILED ||
        type === CallbackType.PG_ORDER_FAILED ||
        type === CallbackType.CHECKOUT_TRANSACTION_ATTEMPT_FAILED ||
        type === CallbackType.PG_TRANSACTION_ATTEMPT_FAILED
      ) {
        status = 'FAILED';
        isPaymentSuccess = false;
      } else {
        status = finalState;
        isPaymentSuccess = finalState === 'COMPLETED';
      }

      if (merchantOrderId) {
        // Update transaction record with full authoritative data
        await this.transactionModel.findOneAndUpdate(
          { orderId: merchantOrderId },
          {
            $set: {
              status,
              transactionId,
              paymentMode,
              paymentDetails,
              errorCode,
              webhookPayload: payload,//for troubleshooting later will remove once it is stable
            },
          },
          { upsert: true, new: true },
        );

        // Update order payment status
        await this.orderModel.findOneAndUpdate(
          { transactionId: merchantOrderId },
          {
            $set: {
              isPaymentSuccess,
              ...(transactionId && { transactionId }),
            },
          },
        );
      }

      return { status, orderId: merchantOrderId };
    } catch (error) {
      throw new InternalServerErrorException('Webhook verification failed');
    }
  }

  // C. Manual Status Check — updates transaction + order from PhonePe status API
  async checkStatus(orderId: string) {
    const response = await this.client.getOrderStatus(orderId);

    const state = response?.state;
    const paymentDetails = response?.paymentDetails ?? [];
    const transactionId = paymentDetails?.[0]?.transactionId || null;
    const paymentMode = paymentDetails?.[0]?.paymentMode || null;
    const errorCode = response?.errorCode || null;

    if (state) {
      await this.transactionModel.findOneAndUpdate(
        { orderId },
        {
          $set: {
            status: state,
            paymentDetails,
            errorCode,
            ...(transactionId && { transactionId }),
            ...(paymentMode && { paymentMode }),
          },
        },
        { upsert: true, new: true },
      );

      await this.orderModel.findOneAndUpdate(
        { transactionId: orderId },
        {
          $set: {
            isPaymentSuccess: state === 'COMPLETED',
            ...(transactionId && { transactionId }),
          },
        },
      );
    }

    return response;
  }

  // D. Get stored transaction record from DB
  async getTransaction(orderId: string) {
    return this.transactionModel.findOne({ orderId });
  }
}