import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../types';

/**
 * Middleware factory for request validation using Zod schemas
 */
export const validateRequest = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
        });
        return;
      }
      
      next(new ValidationError('Invalid request data'));
    }
  };
};

/**
 * Middleware factory for query parameter validation
 */
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: validationErrors,
        });
        return;
      }
      
      next(new ValidationError('Invalid query parameters'));
    }
  };
};

/**
 * Middleware factory for URL parameter validation
 */
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          details: validationErrors,
        });
        return;
      }
      
      next(new ValidationError('Invalid URL parameters'));
    }
  };
}; 