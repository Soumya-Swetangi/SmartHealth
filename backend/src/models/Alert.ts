import mongoose, { Document, Schema } from 'mongoose';

export type AlertRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface IAlert extends Document {
  village: string;
  riskLevel: AlertRiskLevel;
  reason: string;
  reportCount: number;
  symptomsInvolved: string[];
  status: AlertStatus;
  generatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    village: {
      type: String,
      required: true,
      trim: true
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    reportCount: {
      type: Number,
      required: true,
      default: 1
    },
    symptomsInvolved: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active'
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

AlertSchema.index({ village: 1, status: 1 });
AlertSchema.index({ generatedAt: -1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
