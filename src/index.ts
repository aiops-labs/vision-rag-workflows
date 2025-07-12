import { createApp } from './app';
import { appConfig } from './config';
import { pineconeService } from './services/pineconeService';

async function startServer(): Promise<void> {
  try {
    // Initialize Pinecone connection
    console.log('🔗 Initializing Pinecone connection...');
    await pineconeService.initialize();
    console.log('✅ Pinecone connected successfully');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(appConfig.server.port, () => {
      console.log(`
🚀 Vision RAG API Server Started!
📍 Environment: ${appConfig.server.nodeEnv}
🌐 Server: http://localhost:${appConfig.server.port}
📚 API Documentation: http://localhost:${appConfig.server.port}/api/v1
🔍 Health Check: http://localhost:${appConfig.server.port}/api/v1/health
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 