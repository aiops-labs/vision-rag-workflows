import { PineconeDbClient } from '../utils/pinecone';
import { AICohereClientV2 } from '../utils/cohere';
import { appConfig } from '../../../express-api-new/src/config';
import { InternalServerError } from '../../../express-api-new/src/types';

// Activity: Embed PDF page image from base64 and store in Pinecone with metadata including page number
export async function embedPdfPageAndStoreInPinecone(
  base64: string,
  gcsUrl: string,
  pageNumber: number,
  userId: string,
  namespace: string,
  orgId: string
): Promise<void> {
  try {
    console.log('[Activity] Starting PDF page embedding for:', { 
      gcsUrl, 
      pageNumber, 
      userId, 
      namespace, 
      orgId 
    });

    // Generate embedding from base64
    const response = await AICohereClientV2.embed({
      images: [base64],
      model: appConfig.cohere.model,
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

    // Upsert to Pinecone with metadata including page number
    const index = PineconeDbClient.index(appConfig.pinecone.indexName);
    const vector = {
      id: `${orgId}-${userId}-page-${pageNumber}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      values: embedding,
      metadata: {
        namespace: namespace,
        userId: userId,
        orgId: orgId,
        gcsUrl: gcsUrl,
        pageNumber: pageNumber,
        type: 'pdf_page',
        createdAt: new Date().toISOString(),
      },
    };

    await index.namespace(namespace).upsert([vector]);
    console.log('[Activity] Successfully upserted PDF page to Pinecone:', vector.id);

  } catch (error) {
    console.error('[Activity] PDF page embedding error:', error);
    throw new InternalServerError(`Failed to embed PDF page ${pageNumber} and store in Pinecone`);
  }
}
