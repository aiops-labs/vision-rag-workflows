import { Request, Response } from 'express';
import { cohereService } from '../services/cohereService';
import { pineconeService } from '../services/pineconeService';
import { HealthCheckResponse, ApiResponse } from '../types';

export class HealthController {
  /**
   * Basic health check
   */
  async basicHealth(_req: Request, res: Response): Promise<void> {
    const response: ApiResponse<{ status: string; timestamp: string }> = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      message: 'API is running',
    };

    res.status(200).json(response);
  }

  /**
   * Detailed health check with service status
   */
  async detailedHealth(_req: Request, res: Response): Promise<void> {
    try {
      // Check service health
      const [cohereHealth, pineconeHealth] = await Promise.allSettled([
        cohereService.healthCheck(),
        pineconeService.healthCheck(),
      ]);

      const cohereStatus = cohereHealth.status === 'fulfilled' && cohereHealth.value;
      const pineconeStatus = pineconeHealth.status === 'fulfilled' && pineconeHealth.value;

      const overallStatus = cohereStatus && pineconeStatus ? 'healthy' : 'degraded';

      const response: ApiResponse<HealthCheckResponse> = {
        success: overallStatus === 'healthy',
        data: {
          status: overallStatus as 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: process.env['npm_package_version'] || '1.0.0',
          services: {
            cohere: cohereStatus,
            pinecone: pineconeStatus,
          },
        },
        message: overallStatus === 'healthy' 
          ? 'All services are healthy' 
          : 'Some services are experiencing issues',
      };

      res.status(overallStatus === 'healthy' ? 200 : 503).json(response);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(503).json({
        success: false,
        error: 'Health check failed',
      });
    }
  }

  /**
   * Service-specific health checks
   */
  async cohereHealth(_req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await cohereService.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        data: {
          service: 'cohere',
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
        },
        message: isHealthy ? 'Cohere service is healthy' : 'Cohere service is unhealthy',
      });
    } catch (error) {
      console.error('Cohere health check error:', error);
      res.status(503).json({
        success: false,
        error: 'Cohere health check failed',
      });
    }
  }

  async pineconeHealth(_req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await pineconeService.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        data: {
          service: 'pinecone',
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
        },
        message: isHealthy ? 'Pinecone service is healthy' : 'Pinecone service is unhealthy',
      });
    } catch (error) {
      console.error('Pinecone health check error:', error);
      res.status(503).json({
        success: false,
        error: 'Pinecone health check failed',
      });
    }
  }
}

export const healthController = new HealthController(); 