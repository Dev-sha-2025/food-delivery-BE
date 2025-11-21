import { Schema } from 'mongoose';

export const OrderSchema = new Schema({
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },

  orderItems: [
    {
      menuId: String,
      name: String,
      price: Number,
      quantity: Number,
      total: Number
    }
  ],

  orderDate: { type: Date, default: Date.now },
  deliveryStatus: { type: String },
  billAmount: Number,
  paymentMode: String,
  isPaymentSuccess: { type: Boolean },
}, { timestamps: true });

