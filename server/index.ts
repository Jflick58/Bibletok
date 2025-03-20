import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

import bibleRoutes from './src/routes/bibleRoutes';
import logger from './src/utils/logger';
import { handleError, APIError } from './src/utils/errors';

// Create Express app
const app = express();

// Trust proxies (needed for rate limiting behind a proxy)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Move API routes to root - this is important for Vercel deployment
app.use('/', bibleRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running on Vercel'
  });
});

// Root path handler for checking server status
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'BibleTok API Server is running on Vercel',
    endpoints: {
      health: '/health',
      verses: '/verses/...'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  next(new APIError(`Not found - ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleError(err, res);
});

// For Vercel serverless deployment
module.exports = app;