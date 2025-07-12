import { Router } from 'express';
import { searchController } from '../controllers/searchController';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { SearchRequestSchema } from '../types';
import { z } from 'zod';

const router = Router();

// Schema for query parameter validation
const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  topK: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
});

/**
 * @route POST /api/search
 * @desc Search for similar vectors using request body
 * @access Public
 */
router.post(
  '/',
  validateRequest(SearchRequestSchema),
  asyncHandler(searchController.searchVectors.bind(searchController))
);

/**
 * @route GET /api/search
 * @desc Search for similar vectors using query parameters
 * @access Public
 */
router.get(
  '/',
  validateRequest(SearchQuerySchema),
  asyncHandler(searchController.searchByQuery.bind(searchController))
);

/**
 * @route GET /api/search/stats
 * @desc Get search statistics from Pinecone
 * @access Public
 */
router.get(
  '/stats',
  asyncHandler(searchController.getSearchStats.bind(searchController))
);

export default router; 