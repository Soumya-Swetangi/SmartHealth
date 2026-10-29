import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { User } from './models/User';
import { seedDatabase } from './utils/seedData';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas / Local Database and launch server
const startServer = async () => {
  await connectDB();

  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('[Startup] Empty database detected — seeding initial Northeast India demo dataset...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('[Startup] Auto-seed check skipped:', err);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  SmartHealth NE: Community Water & Health Surveillance`);
    console.log(`  Server running on port: ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
};

startServer();
