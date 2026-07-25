import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  purpose: 'password_reset';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true, lowercase: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['password_reset'], required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OTPSchema.index({ email: 1, purpose: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
