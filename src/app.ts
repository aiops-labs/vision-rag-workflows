import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { appConfig } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: appConfig.server.isDevelopment 
      ? ['http://localhost:3000', 'http://localhost:3001']
      : true,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: appConfig.rateLimit.windowMs,
    max: appConfig.rateLimit.maxRequests,
    message: {
      success: false,
      error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Compression
  app.use(compression());

  // Logging
  if (appConfig.server.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.use('/', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
} 