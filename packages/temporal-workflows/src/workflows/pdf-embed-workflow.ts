import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from '../activities/pdf-embed-activities';

const { embedPdfPageAndStoreInPinecone } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 2,
    initialInterval: '5s',
  },
});

export interface PdfEmbedWorkflowInput {
  pages: {
    gcsUrl: string;
    base64: string;
    userId: string;
    namespace: string;
    orgId: string;
    pageNumber: number;
  }[];
}

export async function PdfEmbedWorkflow(input: PdfEmbedWorkflowInput): Promise<string> {
  log.info('[PdfEmbedWorkflow] Starting PDF embedding workflow...');

  for (const page of input.pages) {
    log.info('[PdfEmbedWorkflow] Embedding page', { pageNumber: page.pageNumber });
    await embedPdfPageAndStoreInPinecone(
      page.base64,
      page.gcsUrl,
      page.pageNumber,
      page.userId,
      page.namespace,
      page.orgId
    );
  }

  return 'PDF embedding workflow completed!';
}
