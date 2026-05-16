import { Schema } from 'mongoose';

export const PushSubscriptionSchema = new Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
    restaurantId: { type: String, required: true, index: true },
    userAgent: { type: String },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export interface PushSubscriptionDocument {
  endpoint: string;
  p256dh: string;
  auth: string;
  restaurantId: string;
  userAgent?: string;
  lastSeenAt: Date;
}