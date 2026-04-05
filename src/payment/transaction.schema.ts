import { Schema } from 'mongoose';

export const TransactionSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true }, // merchant order ID
    transactionId: { type: String, default: null },          // PhonePe transaction ID
    amount: { type: Number, required: true },                // amount in INR
    amountInPaise: { type: Number, required: true },         // amount in paise (sent to PhonePe)
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    paymentMode: { type: String, default: null },            // e.g. UPI, CARD
    redirectUrl: { type: String, default: null },            // PhonePe redirect URL
    paymentDetails: { type: Schema.Types.Mixed, default: [] },  // full paymentDetails array
    errorCode: { type: String, default: null },
    webhookPayload: { type: Schema.Types.Mixed, default: null }, // raw webhook data
    errorMessage: { type: String, default: null },
  },
  { timestamps: true },
);

export interface Transaction extends Document {
  orderId: string;
  transactionId: string | null;
  amount: number;
  amountInPaise: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMode: string | null;
  redirectUrl: string | null;
  webhookPayload: any;
  errorMessage: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}