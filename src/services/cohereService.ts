import cohere from 'cohere-ai';
import { appConfig } from '../config';
import { AppError, InternalServerError } from '../types';

export class CohereService {
  private client: typeof cohere;

  constructor() {
    this.client = cohere;
    this.client.init(appConfig.cohere.apiKey);
  }

  /**
   * Generate embeddings for text using Cohere Embed v4
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embed({
        texts,
        model: appConfig.cohere.model,
      });

      if (!response.body.embeddings || response.body.embeddings.length === 0) {
        throw new InternalServerError('No embeddings generated from Cohere');
      }

      return response.body.embeddings;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error('Cohere embedding error:', error);
      throw new InternalServerError('Failed to generate embeddings');
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0]!;
  }

  /**
   * Health check for Cohere service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test with a simple embedding
      await this.generateEmbedding('test');
      return true;
    } catch (error) {
      console.error('Cohere health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cohereService = new CohereService(); 