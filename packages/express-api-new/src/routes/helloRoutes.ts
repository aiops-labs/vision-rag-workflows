import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { startWorkflow } from '../workflow';

const router = Router();

const HelloSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

/**
 * @route POST /api/hello
 * @desc Start HelloWorkflow with a given name
 */
router.post('/', async (req: Request, res: Response) => {
  const validation = HelloSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues,
    });
  }

  const { name } = validation.data;

  try {
    const workflowHandle = await startWorkflow(name);
    return res.status(202).json({
      success: true,
      workflowId: workflowHandle.workflowId,
      message: 'Hello workflow started',
    });
  } catch (error) {
    console.error('Hello workflow error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to start hello workflow',
    });
  }
});

export { router as helloRoutes }; 