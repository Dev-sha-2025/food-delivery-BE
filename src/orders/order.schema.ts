import { Schema } from 'mongoose';

export const OrderSchema = new Schema({
  userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    deliveryAddress: { 
      addressId: String,
      addressDetails: String,
      receiverName: String,
      receiverPhoneNumber: String,
      latlong: String,
    
   },

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
    addressId: { type: String },
  billAmount: Number,
  paymentMode: String,
  isPaymentSuccess: { type: Boolean },
}, { timestamps: true });


export interface Order extends Document {
  userId: string;
  restaurantId: string;
  orderItems: {
    menuId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  orderDate?: Date;
    deliveryStatus: string;
    addressId: string;
  billAmount: number;
  paymentMode: string;
  isPaymentSuccess: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deliveryAddress?: {
      addressId: string;
      addressDetails: string;
      receiverName: string;
      receiverPhoneNumber: string;
      latlong: string;
    };
}

