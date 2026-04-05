import { Controller, Post, Get, Body, Headers, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { PhonePeService } from './phonepe.service';

class InitiatePaymentDto {
  orderId: string;
  amount: number;
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly phonePeService: PhonePeService) {}

  // Frontend calls this to get the redirect URL
  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a PhonePe payment', description: 'Creates a payment order and returns the PhonePe redirect URL.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['orderId', 'amount'],
      properties: {
        orderId: { type: 'string', example: 'ORDER_12345' },
        amount: { type: 'number', example: 299.99, description: 'Amount in INR (will be converted to paise internally)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully', schema: { properties: { url: { type: 'string', example: 'https://mercury-uat.phonepe.com/transact/...' } } } })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async pay(@Body() data: InitiatePaymentDto) {
    const url = await this.phonePeService.initiatePayment(data.orderId, data.amount);
    return { url };
  }

  // PhonePe calls this automatically after payment
  @Post('webhook')
  @ApiOperation({ summary: 'PhonePe webhook callback', description: 'Receives payment status callbacks from PhonePe. Validates signature, calls checkStatus for authoritative data, then persists transaction + order.' })
  @ApiHeader({ name: 'authorization', description: 'PhonePe webhook authorization header for signature verification', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Raw JSON payload sent by PhonePe',
    },
  })
  @ApiResponse({ status: 201, description: 'Webhook processed successfully', schema: { properties: { status: { type: 'string', example: 'OK' }, orderState: { type: 'string', example: 'COMPLETED' } } } })
  @ApiResponse({ status: 500, description: 'Webhook verification failed' })
  async handleWebhook(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
  ) {
    try {

      const rawBody = JSON.stringify(body);

      // Validates signature → calls checkStatus internally → persists transaction + order
      const { status: orderState } = await this.phonePeService.verifyWebhook(authHeader, rawBody);

      return { status: 'OK', orderState }; // Always return 200 to PhonePe
    } catch (error) {
      console.error('Webhook Error:', error.message);
      // Return 200 even on failure so PhonePe does not retry indefinitely
      return { status: 'failed', message: error.message };
    }
  }

  // Frontend calls this after user is redirected back to verify status
  @Get('status-check')
  @ApiOperation({ summary: 'Check payment / order status', description: 'Queries PhonePe for the authoritative status of an order.' })
  @ApiQuery({ name: 'id', required: true, description: 'The merchant order ID to check', example: 'ORDER_12345' })
  @ApiResponse({ status: 200, description: 'Order status retrieved', schema: { properties: { status: { type: 'string', example: 'COMPLETED' } } } })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verify(@Query('id') orderId: string) {
    const status = await this.phonePeService.checkStatus(orderId);
    return { status: status.state };
  }

  // Fetch stored transaction record from DB
  @Get('transaction/:orderId')
  @ApiOperation({ summary: 'Get stored transaction details', description: 'Returns the transaction record saved in the database for a given order ID.' })
  @ApiParam({ name: 'orderId', required: true, description: 'The merchant order ID', example: 'ORDER_12345' })
  @ApiResponse({
    status: 200,
    description: 'Transaction record',
    schema: {
      properties: {
        orderId: { type: 'string' },
        transactionId: { type: 'string' },
        amount: { type: 'number' },
        amountInPaise: { type: 'number' },
        status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] },
        paymentMode: { type: 'string' },
        redirectUrl: { type: 'string' },
        paymentDetails: { type: 'array' },
        errorCode: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('orderId') orderId: string) {
    const transaction = await this.phonePeService.getTransaction(orderId);
    return transaction;
  }
}