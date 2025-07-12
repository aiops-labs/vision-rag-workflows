import { Router } from 'express';
import { embedController } from '../controllers/embedController';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { EmbedRequestSchema } from '../types';
import { z } from 'zod';

const router = Router();

// Schema for batch embed requests
const BatchEmbedRequestSchema = z.object({
  texts: z.array(z.string().min(1)).min(1, 'At least one text is required'),
  namespace: z.string().min(1, 'Namespace is required').max(100, 'Namespace too long'),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * @route POST /api/embed
 * @desc Embed a single text and store in Pinecone
 * @access Public
 */
router.post(
  '/',
  validateRequest(EmbedRequestSchema),
  asyncHandler(embedController.embedText.bind(embedController))
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