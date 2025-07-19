import { PineconeDbClient } from '../utils/pinecone';
import { AICohereClientV2 } from '../utils/cohere';
import { appConfig } from '../../../express-api-new/src/config';
import { InternalServerError } from '../../../express-api-new/src/types';

export interface SearchResult {
  id: string;
  score: number;
  gcsUrl?: string;
  metadata?: Record<string, any>;
}

// Activity: Search for similar vectors in Pinecone using query embedding
export async function searchSimilarVectors(
  query: string,
  namespace: string,
  userId: string,
  orgId: string,
  topK: number = 5
): Promise<SearchResult[]> {
  try {
    console.log('[Activity] Starting vector search for query:', { 
      query, 
      namespace, 
      userId, 
      orgId, 
      topK 
    });

    // Generate embedding for the query using Cohere
    const response = await AICohereClientV2.embed({
      texts: [query],
      model: appConfig.cohere.model,
      inputType: 'search_query',
      embeddingTypes: ['float'],
      outputDimension: 1536
    });

    // Extract embedding from response
    let queryEmbedding: number[] | undefined;
    if (Array.isArray(response.embeddings)) {
      // Case: number[][]
      queryEmbedding = response.embeddings[0];
    } else if (response.embeddings && Array.isArray(response.embeddings.float)) {
      // Case: { float: number[][] }
      queryEmbedding = response.embeddings.float[0];
    }

    if (!queryEmbedding) {
      throw new InternalServerError('No embeddings generated from Cohere for search query');
    }

    // Search in Pinecone
    const index = PineconeDbClient.index(appConfig.pinecone.indexName);
    const searchResults = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK: topK,
      filter: {
        userId: userId,
        orgId: orgId,
        namespace: namespace,
      },
      includeMetadata: true
    });

    // Format results
    const results: SearchResult[] = searchResults.matches?.map(match => ({
      id: match.id || '',
      score: match.score || 0,
      gcsUrl: match.metadata?.['gcsUrl'] as string,
      metadata: match.metadata || {}
    })) || [];

    console.log('[Activity] Search completed successfully:', { 
      resultsCount: results.length,
      topScore: results[0]?.score || 0
    });

    return results;

  } catch (error) {
    console.error('[Activity] Vector search error:', error);
    throw new InternalServerError('Failed to search for similar vectors');
  }
}
