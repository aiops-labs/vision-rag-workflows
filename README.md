# Vision RAG API

A modern Express.js API with TypeScript for text embedding and vector search using Cohere Embed v4 and Pinecone. Built with DRY principles, modular architecture, and best practices.

## Features

- 🚀 **Express.js with TypeScript** - Modern, type-safe API development
- 🔍 **Cohere Embed v4** - State-of-the-art text embeddings
- 🌲 **Pinecone Vector Database** - High-performance vector search
- ✅ **Zod Validation** - Runtime type safety and validation
- 🛡️ **Security Middleware** - Helmet, CORS, rate limiting
- 📊 **Health Checks** - Comprehensive service monitoring
- 🏗️ **Modular Architecture** - Clean separation of concerns
- 🧪 **Error Handling** - Robust error management
- 📝 **API Documentation** - Clear endpoint documentation

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cohere API key
- Pinecone API key and index

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vision-rag-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   PORT=3000
   NODE_ENV=development
   COHERE_API_KEY=your_cohere_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_ENVIRONMENT=your_pinecone_environment_here
   PINECONE_INDEX_NAME=your_index_name_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check

#### `GET /api/v1/health`
Basic health check
```bash
curl http://localhost:3000/api/v1/health
```

#### `GET /api/v1/health/detailed`
Detailed health check with service status
```bash
curl http://localhost:3000/api/v1/health/detailed
```

### Embedding

#### `POST /api/v1/embed`
Embed a single text and store in Pinecone

**Request Body:**
```json
{
  "text": "Your text to embed",
  "namespace": "your-namespace",
  "metadata": {
    "source": "document",
    "category": "technical"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "namespace": "your-namespace",
    "vector": [0.1, 0.2, ...],
    "metadata": {
      "text": "Your text to embed",
      "source": "document",
      "category": "technical",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Text embedded and stored successfully"
}
```

#### `POST /api/v1/embed/batch`
Embed multiple texts in batch

**Request Body:**
```json
{
  "texts": ["Text 1", "Text 2", "Text 3"],
  "namespace": "your-namespace",
  "metadata": {
    "source": "batch-upload"
  }
}
```

### Search

#### `POST /api/v1/search`
Search for similar vectors using request body

**Request Body:**
```json
{
  "query": "search query",
  "namespace": "your-namespace",
  "topK": 10,
  "filter": {
    "category": "technical"
  }
}
```

#### `GET /api/v1/search?q=query&namespace=your-namespace&topK=10`
Search using query parameters

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "score": 0.95,
        "metadata": {
          "text": "Original text",
          "category": "technical"
        }
      }
    ],
    "query": "search query",
    "namespace": "your-namespace",
    "totalResults": 1
  },
  "message": "Found 1 similar results"
}
```

#### `GET /api/v1/search/stats`
Get Pinecone index statistics

## Project Structure

```
src/
├── config/           # Configuration management
├── controllers/      # Business logic controllers
├── middleware/       # Express middleware
├── routes/          # API route definitions
├── services/        # External service integrations
├── types/           # TypeScript types and Zod schemas
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | No | development |
| `COHERE_API_KEY` | Cohere API key | Yes | - |
| `PINECONE_API_KEY` | Pinecone API key | Yes | - |
| `PINECONE_ENVIRONMENT` | Pinecone environment | Yes | - |
| `PINECONE_INDEX_NAME` | Pinecone index name | Yes | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |

## Error Handling

The API uses a centralized error handling system with custom error classes:

- `ValidationError` (400) - Input validation errors
- `NotFoundError` (404) - Resource not found
- `InternalServerError` (500) - Server errors

All errors return consistent JSON responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Zod schema validation
- **Error Sanitization** - Safe error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 