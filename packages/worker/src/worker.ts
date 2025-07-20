import { Worker, NativeConnection } from '@temporalio/worker';
import { greet } from '@vision-rag/shared-workflows';
const TASK_QUEUE = 'vision-rag-queue';

async function run() {
  const connection = await NativeConnection.connect({ address: 'localhost:7233' });

  const worker = await Worker.create({
    connection,
    activities: { greet },
    workflowsPath: require.resolve('@vision-rag/shared-workflows'),
    taskQueue: TASK_QUEUE,
    namespace: 'default',
  });

  console.log(`✅ Worker running on: ${TASK_QUEUE}`);
  await worker.run();
}
run().catch(console.error);
