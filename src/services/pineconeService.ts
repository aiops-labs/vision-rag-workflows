import { Pinecone } from '@pinecone-database/pinecone';
import { appConfig } from '../config';
import { InternalServerError, SearchResult } from '../types';

export class PineconeService {
  private client: Pinecone;
  private index: any; // Pinecone index type

  constructor() {
    this.client = new Pinecone({
      apiKey: appConfig.pinecone.apiKey,
    });
  }

  /**
   * Initialize the Pinecone index
   */
  async initialize(): Promise<void> {
    try {
      this.index = this.client.index(appConfig.pinecone.indexName);
      // Test the connection
      await this.index.describeIndexStats();
    } catch (error) {
      console.error('Pinecone initialization error:', error);
      throw new InternalServerError('Failed to initialize Pinecone connection');
    }
  }

  /**
   * Store vectors in Pinecone
   */
  async upsertVectors(
    vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, any>;
    }>,
    namespace: string
  ): Promise<void> {
    try {
      if (!this.index) {
        await this.initialize();
      }

      await this.index.namespace(namespace).upsert(vectors);
    } catch (error) {
      console.error('Pinecone upsert error:', error);
      throw new InternalServerError('Failed to store vectors in Pinecone');
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryVector: number[],
    namespace: string,
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    try {
      if (!this.index) {
        await this.initialize();
      }

      const searchResponse = await this.index.namespace(namespace).query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        filter,
      });

      if (!searchResponse.matches) {
        return [];
      }

      return searchResponse.matches.map((match: any) => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
      }));
    } catch (error) {
      console.error('Pinecone search error:', error);
      throw new InternalServerError('Failed to search vectors in Pinecone');
    }
  }

  /**
   * Delete vectors by IDs
   */
  async deleteVectors(ids: string[], namespace: string): Promise<void> {
    try {
      if (!this.index) {
        await this.initialize();
      }

      await this.index.namespace(namespace).deleteMany(ids);
    } catch (error) {
      console.error('Pinecone delete error:', error);
      throw new InternalServerError('Failed to delete vectors from Pinecone');
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<any> {
    try {
      if (!this.index) {
        await this.initialize();
      }

      return await this.index.describeIndexStats();
    } catch (error) {
      console.error('Pinecone stats error:', error);
      throw new InternalServerError('Failed to get Pinecone index statistics');
    }
  }

  /**
   * Health check for Pinecone service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getIndexStats();
      return true;
    } catch (error) {
      console.error('Pinecone health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pineconeService = new PineconeService(); 