import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';
import alertRoutes from './routes/alertRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import waterTestRoutes from './routes/waterTestRoutes';
import userRoutes from './routes/userRoutes';
import predictionRoutes from './routes/predictionRoutes';
import { authenticate } from './middleware/authMiddleware';
import { authorizeRoles } from './middleware/roleMiddleware';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { seedDatabase } from './utils/seedData';
import { asyncHandler } from './utils/asyncHandler';

dotenv.config();

const app = express();

// Security & logging middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : [])
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartHealth NE API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Demo database seeding endpoint for Admin dashboard
app.post(
  '/api/seed',
  authenticate,
  authorizeRoles('admin'),
  asyncHandler(async (_req, res) => {
    await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Database seeded with Northeast India sample surveillance data.'
    });
  })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/water-tests', waterTestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/predictions', predictionRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
