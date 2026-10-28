import mongoose, { Document, Schema } from 'mongoose';

export type ReportSourceType = 'handpump' | 'well' | 'river' | 'pond' | 'pipeline' | 'other';
export type ReportStatus = 'pending' | 'under_review' | 'verified' | 'resolved' | 'rejected';
export type FraudReviewStatus = 'not_reviewed' | 'flagged' | 'cleared' | 'confirmed_fraud';

export interface FraudFlag {
  type: string;
  message: string;
  score: number;
}

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  village: string;
  sourceType: ReportSourceType;
  symptoms: string[];
  description?: string;
  reportedAt: Date;
  status: ReportStatus;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  assignedTo?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
  // Fraud detection fields
  fraudScore: number;
  fraudFlags: FraudFlag[];
  fraudReviewStatus: FraudReviewStatus;
  fraudReviewedBy?: mongoose.Types.ObjectId;
  fraudReviewedAt?: Date;
  fraudReviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true
    },
    sourceType: {
      type: String,
      enum: ['handpump', 'well', 'river', 'pond', 'pipeline', 'other'],
      required: true
    },
    symptoms: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      trim: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'resolved', 'rejected'],
      default: 'pending'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [92.9376, 26.2006] // Default Assam/Northeast coordinates
      }
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNotes: {
      type: String,
      trim: true
    },
    // Fraud detection fields (all optional/backward-compatible with defaults)
    fraudScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    fraudFlags: {
      type: [
        {
          type: { type: String },
          message: String,
          score: Number
        }
      ],
      default: []
    },
    fraudReviewStatus: {
      type: String,
      enum: ['not_reviewed', 'flagged', 'cleared', 'confirmed_fraud'],
      default: 'not_reviewed'
    },
    fraudReviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    fraudReviewedAt: {
      type: Date
    },
    fraudReviewNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({ village: 1, reportedAt: -1 });
ReportSchema.index({ status: 1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
