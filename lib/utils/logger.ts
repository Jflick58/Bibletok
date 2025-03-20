import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to Winston
winston.addColors(colors);

// Define the format for the logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Determine if we're in a serverless environment
const isServerless = process.env.NODE_ENV === 'production' && (process.env.VERCEL === '1' || process.env.NEXT_RUNTIME === 'edge');

// Define transports array with type
const allTransports: winston.transport[] = [];

// Always add console transport
allTransports.push(new winston.transports.Console());

// Only add file transports in non-serverless environments
if (!isServerless) {
  try {
    // Create logs directory if it doesn't exist
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Add file transports
    allTransports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
      }),
      new winston.transports.File({ 
        filename: path.join(logDir, 'combined.log')
      })
    );
  } catch (error) {
    console.warn('Could not initialize file logging:', error);
  }
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports: allTransports,
});

export default logger;