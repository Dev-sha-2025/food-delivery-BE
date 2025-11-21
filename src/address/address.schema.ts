import { Schema, Document } from 'mongoose';

export const AddressSchema = new Schema(
  {
    userId: { type: String, required: true },
    addressDetails: { type: String, required: true },
    addressType: { type: String, default: 'home' },
    receiverPhoneNumber: { type: String, required: true },
    receiverName: { type: String, required: true },
    latlong: { type: String },
    isChosen: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    strict: false,
    collection: 'addresses',
    timestamps: true,
  }
);

export interface Address extends Document {
  userId: string;
  addressDetails: string;
  addressType: string;
  receiverPhoneNumber: string;
  receiverName: string;
  latlong?: string;
  isChosen: boolean;
  isDefault: boolean;
  createdAt?: Date;
    updatedAt?: Date;
    addressId?: string;
}
