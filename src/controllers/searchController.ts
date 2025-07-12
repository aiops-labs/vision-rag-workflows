import { Request, Response } from 'express';
import { cohereService } from '../services/cohereService';
import { pineconeService } from '../services/pineconeService';
import { SearchRequest, SearchResponse, ApiResponse } from '../types';

export class SearchController {
  /**
   * Search for similar vectors
   */
  async searchVectors(req: Request, res: Response): Promise<void> {
    const { query, namespace, topK, filter } = req.body as SearchRequest;

    try {
      // Generate embedding for the query
      const queryEmbedding = await cohereService.generateEmbedding(query);

      // Search in Pinecone
      const searchResults = await pineconeService.search(
        queryEmbedding,
        namespace,
        topK,
        filter
      );

      const response: ApiResponse<SearchResponse> = {
        success: true,
        data: {
          results: searchResults,
          query,
          namespace,
          totalResults: searchResults.length,
        },
        message: `Found ${searchResults.length} similar results`,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search vectors',
      });
    }
  }

  /**
   * Search with query parameter (alternative endpoint)
   */
  async searchByQuery(req: Request, res: Response): Promise<void> {
    const { q: query, namespace, topK = 10 } = req.query as {
      q: string;
      namespace: string;
      topK?: string;
    };

    if (!query || !namespace) {
      res.status(400).json({
        success: false,
        error: 'Query (q) and namespace are required',
      });
      return;
    }

    try {
      const topKNumber = parseInt(topK as string, 10) || 10;

      // Generate embedding for the query
      const queryEmbedding = await cohereService.generateEmbedding(query);

      // Search in Pinecone
      const searchResults = await pineconeService.search(
        queryEmbedding,
        namespace,
        topKNumber
      );

      const response: ApiResponse<SearchResponse> = {
        success: true,
        data: {
          results: searchResults,
          query,
          namespace,
          totalResults: searchResults.length,
        },
        message: `Found ${searchResults.length} similar results`,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Search by query error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search vectors',
      });
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await pineconeService.getIndexStats();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Search statistics retrieved successfully',
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get search statistics',
      });
    }
  }
}

export const searchController = new SearchController(); 