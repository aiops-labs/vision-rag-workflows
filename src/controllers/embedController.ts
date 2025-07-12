import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { cohereService } from '../services/cohereService';
import { pineconeService } from '../services/pineconeService';
import { EmbedRequest, EmbedResponse, ApiResponse } from '../types';

export class EmbedController {
  /**
   * Embed text and store in Pinecone
   */
  async embedText(req: Request, res: Response): Promise<void> {
    const { text, namespace, metadata } = req.body as EmbedRequest;

    try {
      // Generate embedding using Cohere
      const embedding = await cohereService.generateEmbedding(text);

      // Create unique ID for the vector
      const vectorId = uuidv4();

      // Store in Pinecone
      await pineconeService.upsertVectors(
        [
          {
            id: vectorId,
            values: embedding,
            metadata: {
              text,
              ...metadata,
              createdAt: new Date().toISOString(),
            },
          },
        ],
        namespace
      );

      const response: ApiResponse<EmbedResponse> = {
        success: true,
        data: {
          id: vectorId,
          namespace,
          vector: embedding,
          metadata: {
            text,
            ...metadata,
            createdAt: new Date().toISOString(),
          },
        },
        message: 'Text embedded and stored successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Embed error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to embed and store text',
      });
    }
  }

  /**
   * Embed multiple texts in batch
   */
  async embedBatch(req: Request, res: Response): Promise<void> {
    const { texts, namespace, metadata } = req.body as {
      texts: string[];
      namespace: string;
      metadata?: Record<string, any>;
    };

    try {
      if (!Array.isArray(texts) || texts.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Texts array is required and must not be empty',
        });
        return;
      }

      // Generate embeddings for all texts
      const embeddings = await cohereService.generateEmbeddings(texts);

      // Prepare vectors for Pinecone
      const vectors = texts.map((text, index) => ({
        id: uuidv4(),
        values: embeddings[index]!,
        metadata: {
          text,
          ...metadata,
          createdAt: new Date().toISOString(),
        },
      }));

      // Store in Pinecone
      await pineconeService.upsertVectors(vectors, namespace);

      const response: ApiResponse<EmbedResponse[]> = {
        success: true,
        data: vectors.map((vector) => ({
          id: vector.id,
          namespace,
          vector: vector.values,
          metadata: vector.metadata,
        })),
        message: `Successfully embedded and stored ${vectors.length} texts`,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Batch embed error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to embed and store texts in batch',
      });
    }
  }
}

export const embedController = new EmbedController(); 