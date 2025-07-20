import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from './activities/imageActivities';

const { embedImageAndStoreInPinecone } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 2,
    initialInterval: '5s',
  },
});

export interface ImageEmbedWorkflowInput {
  gcsUrl: string;
  base64: string;
  userId: string;
  namespace: string;
  orgId: string;
}

export async function ImageEmbedWorkflow(input: ImageEmbedWorkflowInput): Promise<string> {
  log.info('[ImageEmbedWorkflow] Starting image embedding workflow...', {
    gcsUrl: input.gcsUrl,
    userId: input.userId,
    namespace: input.namespace,
    orgId: input.orgId
  });

  try {
    await embedImageAndStoreInPinecone(
      input.base64,
      input.gcsUrl,
      input.userId,
      input.namespace,
      input.orgId
    );

    log.info('[ImageEmbedWorkflow] Successfully embedded and stored image in Pinecone');
    return 'Image successfully embedded and stored in Pinecone!';
  } catch (error) {
    log.error('[ImageEmbedWorkflow] Failed to embed image', { error });
    throw error;
  }
}