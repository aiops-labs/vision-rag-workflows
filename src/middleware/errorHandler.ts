import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { appConfig } from '../config';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle custom AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else {
    // Log unexpected errors in development
    if (appConfig.server.isDevelopment) {
      console.error('Unexpected error:', error);
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(appConfig.server.isDevelopment && {
      stack: error.stack,
      details: error.message,
    }),
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) => {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};

/**
 * Health check middleware
 */
export const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
}; 