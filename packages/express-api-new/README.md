# Express API with Temporal Workflows

A streamlined Express.js API that integrates with Temporal workflows for image and PDF embedding, and vector search functionality.

## Features

### Three Temporal Workflows:

1. **Workflow A - Image Embedding** (`/api/embed/image`)
   - Upload image via URL to GCS
   - Start temporal workflow for embedding
   - Store embeddings in Pinecone with metadata

2. **Workflow B - PDF Embedding** (`/api/embed/pdf`)
   - Upload PDF file
   - Convert each page to image
   - Upload images to GCS
   - Start temporal workflow for batch embedding

3. **Workflow C - Search** (`/api/search`)
   - Query embedding using temporal workflow
   - Search similar vectors in Pinecone
   - Return top K results with GCS URLs and metadata

## API Endpoints

### Embed Image
```bash
POST /api/embed/image
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "namespace": "my-namespace",
  "userId": "user123",
  "orgId": "org456"
}
```

### Embed PDF
```bash
POST /api/embed/pdf
Content-Type: multipart/form-data

# Form data:
# pdf: <PDF file>
# namespace: my-namespace
# userId: user123
# orgId: org456
```

### Search
```bash
POST /api/search
Content-Type: application/json

{
  "query": "search query",
  "namespace": "my-namespace", 
  "userId": "user123",
  "orgId": "org456",
  "topK": 5
}

# Or GET request:
GET /api/search?query=search%20query&namespace=my-namespace&userId=user123&orgId=org456&topK=5
```

### Check Workflow Status
```bash
GET /api/embed/status/:workflowId
```

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the server:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `GCS_BUCKET_NAME`: Google Cloud Storage bucket name
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to GCS service account JSON
- `TEMPORAL_SERVER_URL`: Temporal server address (default: localhost:7233)
- `TEMPORAL_NAMESPACE`: Temporal namespace (default: default)

## Dependencies

- **Express.js**: Web framework
- **Temporal Client**: Workflow orchestration
- **Google Cloud Storage**: File storage
- **Multer**: File upload handling
- **PDF-lib**: PDF processing
- **Sharp**: Image processing
- **Zod**: Request validation

## Integration

This API works with the temporal workflows defined in the `../temporal-workflows` package. Make sure to:

1. Start the Temporal server
2. Run the temporal worker
3. Ensure GCS bucket exists and credentials are configured
4. Start this Express API server

The API handles file uploads and GCS storage, then delegates embedding and search operations to Temporal workflows for reliable, scalable processing.
