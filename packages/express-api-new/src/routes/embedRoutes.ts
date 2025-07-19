import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { temporalService } from '../services/temporalService';
import { gcsService } from '../services/gcsService';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { ApiResponse, EmbedResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Validation schemas
const ImageEmbedSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  namespace: z.string().min(1, 'Namespace is required'),
  userId: z.string().min(1, 'User ID is required'),
  orgId: z.string().min(1, 'Organization ID is required'),
});

const PdfEmbedSchema = z.object({
  namespace: z.string().min(1, 'Namespace is required'),
  userId: z.string().min(1, 'User ID is required'),
  orgId: z.string().min(1, 'Organization ID is required'),
});

/**
 * @route POST /api/embed/image
 * @desc Workflow A - Embed image from URL
 */
router.post('/image', asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validation = ImageEmbedSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues
    });
  }

  const { imageUrl, namespace, userId, orgId } = validation.data;

  try {
    // Download image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: 'Failed to download image from URL'
      });
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const fileName = `image-${Date.now()}.${contentType.split('/')[1]}`;

    // Upload to GCS
    const { gcsUrl, base64 } = await gcsService.uploadBuffer(
      imageBuffer,
      fileName,
      contentType,
      userId,
      namespace
    );

    // Start temporal workflow
    const workflowHandle = await temporalService.startImageEmbedWorkflow({
      gcsUrl,
      base64,
      userId,
      namespace,
      orgId,
    });

    const response_data: ApiResponse<EmbedResponse> = {
      success: true,
      data: {
        workflowId: workflowHandle.workflowId,
        gcsUrl,
        status: 'processing'
      },
      message: 'Image uploaded and embedding workflow started',
    };

    res.status(202).json(response_data);
  } catch (error) {
    console.error('Image embed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process image for embedding',
    });
  }
}));

/**
 * @route POST /api/embed/pdf
 * @desc Workflow B - Embed PDF pages
 */
router.post('/pdf', upload.single('pdf'), asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validation = PdfEmbedSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.issues
    });
  }

  const { namespace, userId, orgId } = validation.data;
  const pdfFile = req.file;

  if (!pdfFile) {
    return res.status(400).json({
      success: false,
      error: 'PDF file is required',
    });
  }

  try {
    // Load PDF and get pages
    const pdfDoc = await PDFDocument.load(pdfFile.buffer);
    const numPages = pdfDoc.getPageCount();
    
    const pdfPages = [];
    
    // Convert each page to image and upload to GCS
    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      // Create a placeholder image for the PDF page
      // In production, use a proper PDF rendering library like pdf2pic or pdf-poppler
      const imageBuffer = await sharp({
        create: {
          width: Math.round(width),
          height: Math.round(height),
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
      .png()
      .toBuffer();

      const fileName = `pdf-page-${i + 1}-${Date.now()}.png`;
      const contentType = 'image/png';

      // Upload page image to GCS
      const { gcsUrl, base64 } = await gcsService.uploadBuffer(
        imageBuffer,
        fileName,
        contentType,
        userId,
        namespace
      );

      pdfPages.push({
        gcsUrl,
        base64,
        userId,
        namespace,
        orgId,
        pageNumber: i + 1
      });
    }

    // Start temporal workflow for PDF embedding
    const workflowHandle = await temporalService.startPdfEmbedWorkflow({
      pages: pdfPages
    });

    const response_data: ApiResponse<EmbedResponse> = {
      success: true,
      data: {
        workflowId: workflowHandle.workflowId,
        totalPages: numPages,
        status: 'processing'
      },
      message: 'PDF processed and embedding workflow started',
    };

    res.status(202).json(response_data);
  } catch (error) {
    console.error('PDF embed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process PDF for embedding',
    });
  }
}));

/**
 * @route GET /api/embed/status/:workflowId
 * @desc Get workflow status
 */
router.get('/status/:workflowId', asyncHandler(async (req: Request, res: Response) => {
  const { workflowId } = req.params;

  try {
    const status = await temporalService.getWorkflowStatus(workflowId!);

    res.json({
      success: true,
      data: {
        workflowId,
        status: status.status.name,
        result: status.status.name === 'COMPLETED' ? await temporalService.getWorkflowResult(workflowId!) : null
      },
      message: 'Workflow status retrieved successfully',
    });
  } catch (error) {
    console.error('Get workflow status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow status',
    });
  }
}));

export { router as embedRoutes };
