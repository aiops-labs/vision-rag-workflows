import { Router } from 'express';
import { embedController } from '../controllers/embedController';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Schema for batch embed requests
const BatchEmbedRequestSchema = z.object({
  imageUrl: z.string().url(),
  namespace: z.string().min(1, 'Namespace is required').max(100, 'Namespace too long'),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * @route POST /api/embed
 * @desc Embed a single text and store in Pinecone
 * @access Public
 */
const ImageEmbedRequestSchema = z.object({
  imageUrl: z.string().url(),
  namespace: z.string().min(1, 'Namespace is required').max(100, 'Namespace too long'),
  metadata: z.record(z.string(), z.any()).optional(),
});

router.post(
  '/',
  validateRequest(ImageEmbedRequestSchema),
  asyncHandler(embedController.embedImage.bind(embedController))
);

/**
 * @route POST /api/embed/batch
 * @desc Embed multiple texts in batch and store in Pinecone
 * @access Public
 */
router.post(
  '/batch',
  validateRequest(BatchEmbedRequestSchema),
  asyncHandler(embedController.embedBatch.bind(embedController))
);

export default router; 