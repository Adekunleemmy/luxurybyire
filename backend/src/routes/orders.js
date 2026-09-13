import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createOrderValidation, updateOrderStatusValidation } from '../validators/orderValidator.js';

const router = Router();

// Public route (checkout)
router.post('/', validate(createOrderValidation), orderController.createOrder);

// Admin routes
router.get('/', requireAuth, orderController.listOrders);
router.get('/stats', requireAuth, orderController.getOrderStats);
router.get('/recent', requireAuth, orderController.getRecentOrders);
router.get('/:id', requireAuth, orderController.getOrder);
router.put('/:id/status', requireAuth, validate(updateOrderStatusValidation), orderController.updateOrderStatus);

export default router;
