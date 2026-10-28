import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'citizen' | 'health_worker' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  village: string;
  phone?: string;
  isActive: boolean;
  phoneVerified: boolean;
  otpHash?: string;
  otpExpiresAt?: Date;
  otpAttempts: number;
  otpRequestedAt?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['citizen', 'health_worker', 'admin'],
      default: 'citizen'
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true,
      default: 'Majuli Island'
    },
    phone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    otpHash: {
      type: String
    },
    otpExpiresAt: {
      type: Date
    },
    otpAttempts: {
      type: Number,
      default: 0
    },
    otpRequestedAt: {
      type: Date
    },
    refreshToken: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
