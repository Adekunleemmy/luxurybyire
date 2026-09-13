import { Router } from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// All upload routes require admin authentication
router.post('/', requireAuth, upload.single('image'), uploadController.uploadImage);
router.post('/multiple', requireAuth, upload.array('images', 10), uploadController.uploadMultipleImages);
router.delete('/*', requireAuth, uploadController.deleteImage);

export default router;
