import mongoose, { Document, Schema } from 'mongoose';

export interface IParticipant {
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  enrollmentNumber: string;
  semester: number;
  department: string;
  mobile: string;
  email: string;
  isLeader: boolean;
}

export interface IMentor {
  fullName: string;
  contactNumber: string;
  email: string;
  department: string;
  institute: string;
  officeAddress: string;
  submittedAt: Date;
}

export interface ITeam extends Document {
  registrationId: string;
  teamName: string;
  status: 'pending_mentor' | 'completed';
  leader: IParticipant;
  members: IParticipant[];
  mentor: IMentor | null;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  fullName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  enrollmentNumber: { type: String, required: true, trim: true, uppercase: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  department: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  isLeader: { type: Boolean, default: false },
});

const MentorSchema = new Schema<IMentor>({
  fullName: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  department: { type: String, required: true },
  institute: { type: String, required: true },
  officeAddress: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const TeamSchema = new Schema<ITeam>(
  {
    registrationId: { type: String, required: true, unique: true },
    teamName: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ['pending_mentor', 'completed'], default: 'pending_mentor' },
    leader: { type: ParticipantSchema, required: true },
    members: { type: [ParticipantSchema], required: true },
    mentor: { type: MentorSchema, default: null },
  },
  { timestamps: true }
);

// Indexes for fast queries (registrationId & teamName already indexed via unique:true)
TeamSchema.index({ status: 1 });
TeamSchema.index({ 'leader.department': 1 });
TeamSchema.index({ 'leader.email': 1 });
TeamSchema.index({ 'members.enrollmentNumber': 1 });
TeamSchema.index({ createdAt: -1 });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
