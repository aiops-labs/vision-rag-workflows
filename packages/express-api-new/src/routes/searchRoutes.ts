import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { temporalService } from '../services/temporalService';
import { ApiResponse, SearchResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Validation schema
const SearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  userId: z.string().min(1, 'User ID is required'),
  orgId: z.string().min(1, 'Organization ID is required'),
  topK: z.number().int().min(1).max(100).default(5),
});

const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  userId: z.string().min(1, 'User ID is required'),
  orgId: z.string().min(1, 'Organization ID is required'),
  topK: z.string().optional().transform((val) => val ? parseInt(val, 10) : 5),
});

/**
 * @route POST /api/search
 * @desc Workflow C - Search for similar vectors (POST version)
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validation = SearchSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues
    });
  }

  const { query, namespace, userId, orgId, topK } = validation.data;

  try {
    // Start temporal search workflow
    const searchResult = await temporalService.startSearchWorkflow({
      query,
      namespace,
      userId,
      orgId,
      topK
    });

    const response: ApiResponse<SearchResponse> = {
      success: true,
      data: {
        results: searchResult.results.map(result => ({
          id: result.id,
          score: result.score,
          metadata: {
            ...result.metadata,
            ...(result.gcsUrl && { gcsUrl: result.gcsUrl })
          }
        })),
        query: searchResult.query,
        namespace,
        totalResults: searchResult.totalResults,
      },
      message: `Found ${searchResult.totalResults} similar results`,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search vectors',
    });
  }
}));

/**
 * @route GET /api/search
 * @desc Workflow C - Search for similar vectors (GET version with query params)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  // Validate query parameters
  const validation = SearchQuerySchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues
    });
  }

  const { query, namespace, userId, orgId, topK } = validation.data;

  try {
    // Start temporal search workflow
    const searchResult = await temporalService.startSearchWorkflow({
      query,
      namespace,
      userId,
      orgId,
      topK
    });

    const response: ApiResponse<SearchResponse> = {
      success: true,
      data: {
        results: searchResult.results.map(result => ({
          id: result.id,
          score: result.score,
          metadata: {
            ...result.metadata,
            ...(result.gcsUrl && { gcsUrl: result.gcsUrl })
          }
        })),
        query: searchResult.query,
        namespace,
        totalResults: searchResult.totalResults,
      },
      message: `Found ${searchResult.totalResults} similar results`,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search vectors',
    });
  }
}));

export { router as searchRoutes };
