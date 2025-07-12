import { Router } from 'express';
import embedRoutes from './embedRoutes';
import searchRoutes from './searchRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Mount routes
router.use(`${API_PREFIX}/embed`, embedRoutes);
router.use(`${API_PREFIX}/search`, searchRoutes);
router.use(`${API_PREFIX}/health`, healthRoutes);

// Root endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Vision RAG API',
    version: '1.0.0',
    endpoints: {
      embed: `${API_PREFIX}/embed`,
      search: `${API_PREFIX}/search`,
      health: `${API_PREFIX}/health`,
    },
  });
});

export default router; 