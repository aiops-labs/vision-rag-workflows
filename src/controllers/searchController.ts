import { Request, Response } from 'express';
import { cohereService } from '../services/cohereService';
import { pineconeService } from '../services/pineconeService';
import { SearchResponse, ApiResponse } from '../types';

export class SearchController {
  /**
   * Search with query parameter (alternative endpoint)
   */
  async searchByQuery(req: Request, res: Response): Promise<void> {
    const { query, namespace = "default", topK = 3 } = req.query as {
      query: string;
      namespace: string;
      topK?: string;
    };

    if (!query || !namespace) {
      res.status(400).json({
        success: false,
        error: 'Query (query) and namespace are required',
      });
      return;
    }

    try {
      const topKNumber = parseInt(topK as string, 10) || 10;

      // Generate embedding for the query
      const queryEmbeddingArr = await cohereService.generateEmbeddings(query);
      const queryEmbedding = queryEmbeddingArr[0];

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
   * Search with request body (POST endpoint)
   */
  async searchByBody(req: Request, res: Response): Promise<void> {
    const { query, namespace = "default", topK = 3 } = req.body as {
      query: string;
      namespace: string;
      topK?: number;
    };

    if (!query || !namespace) {
      res.status(400).json({
        success: false,
        error: 'Query (query) and namespace are required',
      });
      return;
    }

    try {

      // Generate embedding for the query
      const queryEmbeddingArr = await cohereService.generateEmbeddings(query);
      // console.log("query:", queryEmbeddingArr)
      // Search in Pinecone
      const searchResults = await pineconeService.search(
        queryEmbeddingArr.float,
        namespace,
        topK
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
      console.error('Search by body error:', error);
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