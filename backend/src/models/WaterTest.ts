import mongoose, { Document, Schema } from 'mongoose';

export type WaterTestResult = 'safe' | 'unsafe' | 'borderline';

export interface IWaterTest extends Document {
  reportId?: mongoose.Types.ObjectId;
  village: string;
  sourceType: string;
  testedBy: mongoose.Types.ObjectId;
  testDate: Date;
  parameters: {
    pH?: number;
    turbidity?: number;
    chlorine?: number;
    coliform?: boolean;
    ecoli?: boolean;
  };
  result: WaterTestResult;
  notes?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
}

const WaterTestSchema = new Schema<IWaterTest>(
  {
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report'
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true
    },
    sourceType: {
      type: String,
      required: [true, 'Source type is required'],
      trim: true
    },
    testedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    testDate: {
      type: Date,
      default: Date.now
    },
    parameters: {
      pH: { type: Number },
      turbidity: { type: Number },
      chlorine: { type: Number },
      coliform: { type: Boolean, default: false },
      ecoli: { type: Boolean, default: false }
    },
    result: {
      type: String,
      enum: ['safe', 'unsafe', 'borderline'],
      required: true
    },
    notes: {
      type: String,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [92.9376, 26.2006]
      }
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

WaterTestSchema.index({ village: 1, testDate: -1 });

export const WaterTest = mongoose.model<IWaterTest>('WaterTest', WaterTestSchema);
