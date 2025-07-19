import { Worker } from '@temporalio/worker';
import * as workflows from '@vision-rag/shared-workflows';

console.log(workflows)

async function run() {
  await Worker.create({
    workflowsPath: require.resolve('@vision-rag/shared-workflows'),
    taskQueue: 'vision-rag-api',
    namespace: 'default',
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
