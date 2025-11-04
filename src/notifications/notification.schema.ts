import { Schema, Document } from 'mongoose';

export interface Notification extends Document {
  notificationId: string;
  restaurantId: string;
  type: string;
  heading: string;
  userId: string;
  description: string;
  status: string;
  dateTime: Date;
  isDeleted: boolean; // soft delete flag
}

export const NotificationSchema = new Schema(
  {
    notificationId: { type: String, index: true },
    restaurantId: String,
    type: { type: String, enum: ['success', 'info', 'error', 'warning', 'attention'] },
    heading: String,
    userId: String,
    description: String,
    status: String,
    dateTime: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { strict: false, timestamps: true }
);
