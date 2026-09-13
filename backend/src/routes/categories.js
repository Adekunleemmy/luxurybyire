import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createCategoryValidation, updateCategoryValidation } from '../validators/categoryValidator.js';

const router = Router();

// Public routes
router.get('/', categoryController.listCategories);
router.get('/:idOrSlug', categoryController.getCategory);

// Admin routes
router.post('/', requireAuth, validate(createCategoryValidation), categoryController.createCategory);
router.put('/:id', requireAuth, validate(updateCategoryValidation), categoryController.updateCategory);
router.delete('/:id', requireAuth, categoryController.deleteCategory);

export default router;
