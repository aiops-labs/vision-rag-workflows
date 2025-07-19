"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var worker_1 = require("@temporalio/worker");
await worker_1.Worker.create({
    workflowsPath: require.resolve('@vision-rag/shared-workflows'),
    taskQueue: 'vision-rag-api',
    namespace: 'default',
});
