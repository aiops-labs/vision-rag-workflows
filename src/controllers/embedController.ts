import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { cohereService } from '../services/cohereService';
import { pineconeService } from '../services/pineconeService';
import { EmbedResponse, ApiResponse, InternalServerError } from '../types';

export class EmbedController {
  async embedBatch(req: Request, res: Response): Promise<void> {
    const { image_urls, namespace } = req.body;
    try {
      if (!Array.isArray(image_urls) || image_urls.length === 0) {
        res.status(400).json({
          success: false,
          error: 'image_urls array is required and must not be empty',
        });
        return;
      }
      // For batch, call generateEmbeddingsFromUrl for each image URL
      const cohereResponses = await Promise.all(image_urls.map((url: string) => cohereService.generateEmbeddingsFromUrl(url)));
      const vectors = image_urls.map((image_url, index) => ({
        id: uuidv4(),
        values: cohereResponses[index].embeddings.float[0],
        metadata: {
          image_url,
          // ...metadata,
          createdAt: new Date().toISOString(),
        },
        cohere: cohereResponses[index]
      }));
      await pineconeService.upsertVectors(vectors.map(v => ({ id: v.id, values: v.values, metadata: v.metadata })), namespace);
      const response: ApiResponse<EmbedResponse[]> = {
        success: true,
        data: vectors.map((vector) => ({
          id: vector.id,
          namespace,
          vector: vector.values,
          metadata: vector.metadata,
          cohere: vector.cohere
        })),
        message: `Successfully embedded and stored ${vectors.length} image URLs`,
      };
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to embed and store image URLs in batch',
      });
    }
  }

  async embedImage(req: Request, res: Response): Promise<void> {
    const { imageUrl, namespace = "test" } = req.body;
    try {
      const  cohereResp = await cohereService.generateEmbeddingsFromUrl(imageUrl);
      console.log(cohereResp, "cohere response")

      const vectorId = uuidv4();
      console.log("Pinecone processing")
      const raw = cohereResp.embeddings;

      // Some Cohere SDKs have extra nesting in `float.float`, so normalize it:
      const embeddingVector = Array.isArray(raw.float)
        ? raw.float
        : Array.isArray(raw.float?.float)
          ? raw.float.float
          : [];

      if (!embeddingVector.length || !Array.isArray(embeddingVector[0])) {
        throw new InternalServerError('Malformed embedding vector returned by Cohere');
      }
      await pineconeService.upsertVectors([
        {
          id: vectorId,
          values: embeddingVector,
          metadata: {
            image_url: imageUrl,
            createdAt: new Date().toISOString(),
          },
        },
      ], namespace);
      const response: ApiResponse<EmbedResponse> = {
        success: true,
        data: {
          id: vectorId,
          namespace,
          vector: cohereResp.embeddings.float[0],
          metadata: {
            image_url: imageUrl,
            createdAt: new Date().toISOString(),
          },
          cohere: cohereResp
        },
        message: 'Image embedded and stored successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      
      res.status(500).json({
        success: false,
        error: 'Failed to embed and store image',
      });
    }
  }
}

export const embedController = new EmbedController(); 