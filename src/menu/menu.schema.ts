import { Schema } from 'mongoose';

export const MenuSchema = new Schema({
  restaurantId: { type: String, required: true },
  name: { type: String, required: true },
  classification: { type: String },
  price: { type: Number, required: true },
  itemDescription: { type: String },
  imageUrl: { type: String },
  category: { type: String },
  itemAvailable: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }, // ✅ soft delete flag
  createdOn: { type: Date, default: Date.now },
}, { versionKey: false });
