import { Client, WorkflowHandle } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';

// Import workflow types
export interface ImageEmbedWorkflowInput {
  gcsUrl: string;
  base64: string;
  userId: string;
  namespace: string;
  orgId: string;
}

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

export interface SearchWorkflowInput {
  query: string;
  namespace: string;
  userId: string;
  orgId: string;
  topK?: number;
}

export interface SearchWorkflowResult {
  results: {
    id: string;
    score: number;
    gcsUrl?: string;
    metadata?: Record<string, any>;
  }[];
  query: string;
  totalResults: number;
}

export class TemporalService {
  private client: Client | null = null;
  private readonly taskQueue = 'vision-rag-queue';

  async getClient(): Promise<Client> {
    if (!this.client) {
      const connection = await NativeConnection.connect({
        address: 'localhost:7233',
        // TLS and gRPC metadata configuration goes here.
      });
      this.client = new Client({
        connection: connection,
        namespace: process.env['TEMPORAL_NAMESPACE'] || 'default',
      });
    }
    return this.client;
  }

  async startImageEmbedWorkflow(input: ImageEmbedWorkflowInput): Promise<WorkflowHandle> {
    const client = await this.getClient();
    
    return client.workflow.start('ImageEmbedWorkflow', {
      args: [input],
      taskQueue: this.taskQueue,
      workflowId: `image-embed-${input.userId}-${input.orgId}-${Date.now()}`,
    });
  }

  async startPdfEmbedWorkflow(input: PdfEmbedWorkflowInput): Promise<WorkflowHandle> {
    const client = await this.getClient();
    
    return client.workflow.start('PdfEmbedWorkflow', {
      args: [input],
      taskQueue: this.taskQueue,
      workflowId: `pdf-embed-${input.pages[0]?.userId}-${input.pages[0]?.orgId}-${Date.now()}`,
    });
  }

  async startSearchWorkflow(input: SearchWorkflowInput): Promise<SearchWorkflowResult> {
    const client = await this.getClient();
    
    const handle = await client.workflow.start('SearchWorkflow', {
      args: [input],
      taskQueue: this.taskQueue,
      workflowId: `search-${input.userId}-${input.orgId}-${Date.now()}`,
    });

    // Wait for the workflow to complete and return the result
    return await handle.result();
  }

  async getWorkflowResult(workflowId: string): Promise<any> {
    const client = await this.getClient();
    const handle = client.workflow.getHandle(workflowId);
    return await handle.result();
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    const client = await this.getClient();
    const handle = client.workflow.getHandle(workflowId);
    return await handle.describe();
  }
}

export const temporalService = new TemporalService();
