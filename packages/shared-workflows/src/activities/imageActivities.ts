import { PineconeDbClient } from '../utils/pinecone';
import { AICohereClientV2 } from '../utils/cohere';
import { model, indexName } from '../utils/constants'
import { InternalServerError } from '../utils/types';

// Activity: Embed image from base64 and store in Pinecone with metadata
export async function embedImageAndStoreInPinecone(
  base64: string,
  gcsUrl: string,
  userId: string,
  namespace: string,
  orgId: string
): Promise<void> {
  try {
    console.log('[Activity] Starting image embedding for:', { gcsUrl, userId, namespace, orgId });

    // Generate embedding from base64
    const response = await AICohereClientV2.embed({
      images: [base64],
      model: model,
      inputType: 'image',
      embeddingTypes: ['float'],
      outputDimension: 1536
    });

    // Extract embedding from response
    let embedding: number[] | undefined;
    if (Array.isArray(response.embeddings)) {
      // Case: number[][]
      embedding = response.embeddings[0];
    } else if (response.embeddings && Array.isArray(response.embeddings.float)) {
      // Case: { float: number[][] }
      embedding = response.embeddings.float[0];
    }

    if (!embedding) {
      throw new InternalServerError('No embeddings generated from Cohere');
    }

    // Validation: check if embedding is valid
    if (!Array.isArray(embedding) || embedding.length === 0 || embedding.some(v => typeof v !== 'number' || isNaN(v))) {
      throw new InternalServerError('Embedding is empty or malformed, cannot upsert to Pinecone');
    }

    // Upsert to Pinecone with metadata
    const index = PineconeDbClient.index(indexName);
    const vector = {
      id: `${orgId}-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      values: embedding,
      metadata: {
        namespace: namespace,
        userId: userId,
        orgId: orgId,
        gcsUrl: gcsUrl,
        type: 'image',
        createdAt: new Date().toISOString(),
      },
    };

    await index.namespace(namespace).upsert([vector]);
    console.log('[Activity] Successfully upserted image to Pinecone:', vector.id);

  } catch (error) {
    console.error('[Activity] Image embedding error:', error);
    throw new InternalServerError('Failed to embed image and store in Pinecone');
  }
}