# Express API with Temporal Workflows

[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue)](https://www.npmjs.com/package/@vision-rag-api/express-api-new)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

A streamlined Express.js API that integrates with Temporal workflows for image and PDF embedding, and vector search functionality.
NOTE: This is an experiment repository and might need careful code walkthrough to be able to implement on production.
---

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Image Embedding**: Upload images via URL, store in GCS, embed with Temporal, and index in Pinecone.
- **PDF Embedding**: Upload PDFs, convert pages to images, store in GCS, embed with Temporal, and index in Pinecone.
- **Vector Search**: Query embeddings using Temporal workflows and retrieve similar vectors from Pinecone.

---

## Installation

```bash
npm install @vision-rag-api/express-api-new
```

---

## Usage

```ts
import express from 'express';
import { embedRoutes } from '@vision-rag-api/express-api-new';

const app = express();
app.use('/api/embed', embedRoutes);
// ... other routes and middleware
app.listen(3000);
```

Or run the included server:

```bash
npm run dev # for development
npm run build && npm start # for production
```

---

## API Reference

### Embed Image
`POST /api/embed/image`
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "namespace": "my-namespace",
  "userId": "user123",
  "orgId": "org456"
}
```

### Embed PDF
`POST /api/embed/pdf` (multipart/form-data)
- `pdf`: PDF file
- `namespace`, `userId`, `orgId`: strings

### Search
`POST /api/search`
```json
{
  "query": "search query",
  "namespace": "my-namespace",
  "userId": "user123",
  "orgId": "org456",
  "topK": 5
}
```
Or
`GET /api/search?query=...&namespace=...&userId=...&orgId=...&topK=5`

### Check Workflow Status
`GET /api/embed/status/:workflowId`

---

## Environment Variables
- `PORT`: Server port (default: 3000)
- `GCS_BUCKET_NAME`: Google Cloud Storage bucket name
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to GCS service account JSON
- `TEMPORAL_SERVER_URL`: Temporal server address (default: localhost:7233)
- `TEMPORAL_NAMESPACE`: Temporal namespace (default: default)

---

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
3. Start the server:
   ```bash
   npm run dev
   # or for production
   npm run build && npm start
   ```

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines. If this file does not exist yet, please create one in the root directory.

---

## License

This project is licensed under the MIT License. See [LICENSE](../../LICENSE) for details. If this file does not exist yet, please create one in the root directory.
