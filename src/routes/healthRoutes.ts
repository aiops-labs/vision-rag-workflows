import { Router } from 'express';
import { healthController } from '../controllers/healthController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route GET /api/health
 * @desc Basic health check
 * @access Public
 */
router.get(
  '/',
  asyncHandler(healthController.basicHealth.bind(healthController))
);

/**
 * @route GET /api/health/detailed
 * @desc Detailed health check with service status
 * @access Public
 */
router.get(
  '/detailed',
  asyncHandler(healthController.detailedHealth.bind(healthController))
);

/**
 * @route GET /api/health/cohere
 * @desc Cohere service health check
 * @access Public
 */
router.get(
  '/cohere',
  asyncHandler(healthController.cohereHealth.bind(healthController))
);

/**
 * @route GET /api/health/pinecone
 * @desc Pinecone service health check
 * @access Public
 */
router.get(
  '/pinecone',
  asyncHandler(healthController.pineconeHealth.bind(healthController))
);

export default router; 