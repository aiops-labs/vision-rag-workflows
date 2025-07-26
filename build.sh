#!/bin/bash

cd packages/shared-workflows && npm run build && cd ../..
cd packages/express-api-new && npm run build && cd ../..
cd packages/worker && npm run build && cd ../..