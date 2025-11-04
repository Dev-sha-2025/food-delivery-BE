import { Schema, Document } from 'mongoose';

export const RestaurantSchema = new Schema(
  {
    restaurantName: { type: String, required: true },
    address: { type: String },
    latLng: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { collection: 'restaurants', strict :false,timestamps: true }
);

export interface Restaurant extends Document {
  restaurantName: string;
  address?: string;
  latLng?: string;
  isActive: boolean;
}
