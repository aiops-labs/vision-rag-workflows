import { CohereClientV2 } from 'cohere-ai';
import { appConfig } from '../config';
import { AppError, InternalServerError } from '../types';

export class CohereService {
  private client: CohereClientV2;

  constructor() {
    this.client = new CohereClientV2({
      token: appConfig.cohere.apiKey
    });
  }

  async generateEmbeddings(query: string): Promise<any> {
    try {
      const response = await this.client.embed({
        texts: [query],
        model: appConfig.cohere.model,
        inputType: 'search_query',
        embeddingTypes: ['float'],
        outputDimension: 1536
      });

      if (!response.embeddings) {
        throw new InternalServerError('No embeddings generated from Cohere for query');
      }

      return response.embeddings;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error('Cohere embedding error:', error);
      throw new InternalServerError('Failed to generate embeddings for query');
    }
  }

  async generateEmbeddingsFromUrl(image_url: string): Promise<any> {
    try {
      console.log('[CohereService] Fetching image:', image_url);
      const image = await fetch(image_url);
      const buffer = await image.arrayBuffer();
      const stringifiedBuffer = Buffer.from(buffer).toString('base64');
      const contentType = image.headers.get('content-type');
      const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;

      const response = await this.client.embed({
        images: [imageBase64],
        model: appConfig.cohere.model,
        inputType: 'image',
        embeddingTypes: ['float'],
        outputDimension: 1536
      });

      console.log('[CohereService] Cohere API response:', response);

      if (!response.embeddings) {
        throw new InternalServerError('No embeddings generated from Cohere');
      }

      // Return the full response in the required format
      return {
        id: response.id,
        embeddings: {
          float: response.embeddings
        },
        texts: response.texts,
        meta: response.meta,
      };
    } catch (error) {
      console.error('[CohereService] Cohere embedding error:', error);
      throw new InternalServerError('Failed to generate image embeddings');
    }
  }
}

// Export singleton instance
export const cohereService = new CohereService(); 