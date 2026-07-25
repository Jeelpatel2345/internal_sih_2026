import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  registrationOpen: boolean;
  registrationDeadline: Date;
  siteTitle: string;
  maintenanceMode: boolean;
  updatedBy: mongoose.Types.ObjectId | null;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    registrationOpen: { type: Boolean, default: true },
    registrationDeadline: {
      type: Date,
      default: new Date('2026-08-02T18:29:00.000Z'),
    },
    siteTitle: { type: String, default: 'Internal SIH 2026' },
    maintenanceMode: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
