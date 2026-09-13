import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as productController from '../controllers/productController.js';
import * as orderController from '../controllers/orderController.js';

const router = Router();

// Admin dashboard stats
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const { getProductStats } = await import('../services/productService.js');
    const { getOrderStats } = await import('../services/orderService.js');
    const [productStats, orderStats] = await Promise.all([
      getProductStats(),
      getOrderStats(),
    ]);

    res.json({ success: true, data: { productStats, orderStats } });
  } catch (error) {
    next(error);
  }
});

// Admin product listing (includes unavailable)
router.get('/products', requireAuth, async (req, res, next) => {
  try {
    const { listAllProducts } = await import('../services/productService.js');
    const result = await listAllProducts(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
