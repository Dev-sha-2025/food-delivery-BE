import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema({
  countryCode: String,
  phoneNumber: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: String,
  userId: String,
}, { strict: false,collection:'users',timestamps:true }); // allow dynamic fields

export interface User extends Document {
  countryCode: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  lastOnline?: Date;
  createdAt?: Date;
  userId: string;
}
