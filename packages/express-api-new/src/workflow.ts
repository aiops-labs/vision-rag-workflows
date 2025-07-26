import { Connection, Client } from '@temporalio/client';
import { HelloWorkflow } from '@vision-rag/shared-workflows';

export async function startWorkflow(name: string) {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  return await client.workflow.start(HelloWorkflow, {
    taskQueue: 'vision-rag-queue',
    workflowId: `hello-${Date.now()}`,
    args: [name],
  });
}
