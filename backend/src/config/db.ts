import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-health-northeast';
    const conn = await mongoose.connect(connUri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    // Do not crash in local mock mode if user is testing offline
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
