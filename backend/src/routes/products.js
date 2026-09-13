import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createProductValidation, updateProductValidation } from '../validators/productValidator.js';

const router = Router();

// Public routes
router.get('/', productController.listProducts);
router.get('/brands', productController.getBrands);
router.get('/stats', requireAuth, productController.getProductStats);
router.get('/:idOrSlug', productController.getProduct);

// Admin routes
router.post('/', requireAuth, validate(createProductValidation), productController.createProduct);
router.put('/:id', requireAuth, validate(updateProductValidation), productController.updateProduct);
router.delete('/:id', requireAuth, productController.deleteProduct);

export default router;
