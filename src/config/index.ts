import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  COHERE_API_KEY: z.string().min(1, 'COHERE_API_KEY is required'),
  PINECONE_API_KEY: z.string().min(1, 'PINECONE_API_KEY is required'),
  PINECONE_ENVIRONMENT: z.string().min(1, 'PINECONE_ENVIRONMENT is required'),
  PINECONE_INDEX_NAME: z.string().min(1, 'PINECONE_INDEX_NAME is required'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
});

// Validate and parse environment variables
const envParseResult = EnvironmentSchema.safeParse(process.env);

if (!envParseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envParseResult.error.format());
  process.exit(1);
}

export const config = envParseResult.data;

// Configuration object
export const appConfig = {
  server: {
    port: config.PORT,
    nodeEnv: config.NODE_ENV,
    isDevelopment: config.NODE_ENV === 'development',
    isProduction: config.NODE_ENV === 'production',
    isTest: config.NODE_ENV === 'test',
  },
  cohere: {
    apiKey: config.COHERE_API_KEY,
    model: 'embed-english-v3.0', // Cohere Embed v4 equivalent
  },
  pinecone: {
    apiKey: config.PINECONE_API_KEY,
    environment: config.PINECONE_ENVIRONMENT,
    indexName: config.PINECONE_INDEX_NAME,
  },
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  },
} as const; 