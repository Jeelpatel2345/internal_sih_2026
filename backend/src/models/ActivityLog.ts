import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  adminId: mongoose.Types.ObjectId | null;
  adminName: string;
  action: string;
  target: string;
  details: string;
  ip: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  adminId: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  adminName: { type: String, default: 'System' },
  action: { type: String, required: true },
  target: { type: String, default: '' },
  details: { type: String, default: '' },
  ip: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

ActivityLogSchema.index({ timestamp: -1 });
ActivityLogSchema.index({ adminId: 1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
