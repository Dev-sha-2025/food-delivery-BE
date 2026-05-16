import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webpush from 'web-push';
import { SubscribeDto } from './push.dto';
import { PushSubscriptionDocument } from './push-subscription.schema';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @InjectModel('PushSubscription')
    private readonly pushSubModel: Model<PushSubscriptionDocument>,
  ) {}

  onModuleInit() {
    const subject = process.env.VAPID_SUBJECT;
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!subject || !publicKey || !privateKey) {
      this.logger.warn(
        'VAPID environment variables are not set — web push notifications will not work.',
      );
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.logger.log('VAPID details configured successfully.');
  }

  /** Idempotent upsert — safe to call on every app start */
  async subscribe(dto: SubscribeDto, userAgent: string): Promise<void> {
    const { subscription, restaurantId } = dto;

    await this.pushSubModel.updateOne(
      { endpoint: subscription.endpoint },
      {
        $set: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          restaurantId,
          userAgent,
          lastSeenAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  /** Fan-out a push notification to all subscriptions for a given restaurant */
  async notifyNewOrder(order: {
    _id: any;
    restaurantId: string;
    orderItems: { quantity: number }[];
    billAmount: number;
    customerName?: string;
  }): Promise<void> {
    const subs = await this.pushSubModel.find({
      restaurantId: String(order.restaurantId),
    });

    this.logger.log(
      `notifyNewOrder: restaurantId=${order.restaurantId} | subscriptions found=${subs.length}`,
    );

    if (!subs.length) return;

    const orderIdShort = String(order._id).substring(0, 8);
    const itemCount = order.orderItems.reduce(
      (sum, i) => sum + (i.quantity || 0),
      0,
    );
    const amount = `₹${Number(order.billAmount).toFixed(2)}`;
    const customer = order.customerName ? ` from ${order.customerName}` : '';

    const payload = JSON.stringify({
      title: `🔔 New Order #${orderIdShort}`,
      body: `${itemCount} item${itemCount !== 1 ? 's' : ''} · ${amount}${customer}\nTap to view details`,
      tag: `order-${order._id}`,
      url: `/orders/${order._id}`,
      orderId: String(order._id),

      // ── Rich-notification fields (Swiggy / Zomato style) ──────────────
      // Publicly accessible food-order illustration shown as hero image
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',

      // Inline action buttons rendered below the body on Chrome/Edge/Android
      actions: [
        { action: 'view',    title: '👁 View Order'  },
        { action: 'dismiss', title: '✕ Dismiss'      },
      ],
    });

    await Promise.all(
      subs.map(async (sub) => {
        this.logger.log(`Sending push to endpoint: ${sub.endpoint.substring(0, 60)}...`);
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
            { TTL: 60 },
          );
          this.logger.log(`Push sent successfully to: ${sub.endpoint.substring(0, 60)}...`);
        } catch (err: any) {
          // 410 Gone or 404 Not Found = subscription is dead, prune it
          if (err.statusCode === 410 || err.statusCode === 404) {
            await this.pushSubModel.deleteOne({ endpoint: sub.endpoint });
            this.logger.log(`Pruned dead subscription: ${sub.endpoint}`);
          } else {
            this.logger.error(
              `Push send failed for endpoint ${sub.endpoint}: [${err.statusCode}] ${err.body}`,
            );
          }
        }
      }),
    );
  }
}