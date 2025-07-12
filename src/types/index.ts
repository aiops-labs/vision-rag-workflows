import { z } from 'zod';

// Base schemas
export const EmbedRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
  namespace: z.string().min(1, 'Namespace is required').max(100, 'Namespace too long'),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').max(1000, 'Query too long'),
  namespace: z.string().min(1, 'Namespace is required').max(100, 'Namespace too long'),
  topK: z.number().int().min(1).max(100).default(10),
  filter: z.record(z.string(), z.any()).optional(),
});

export const HealthCheckResponseSchema = z.object({
  status: z.literal('healthy'),
  timestamp: z.string(),
  uptime: z.number(),
  version: z.string(),
  services: z.object({
    cohere: z.boolean(),
    pinecone: z.boolean(),
  }),
});

// Type exports
export type EmbedRequest = z.infer<typeof EmbedRequestSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EmbedResponse {
  id: string;
  namespace: string;
  vector: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  namespace: string;
  totalResults: number;
}

// Error types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public override message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(500, message);
  }
} 