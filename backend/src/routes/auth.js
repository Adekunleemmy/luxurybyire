import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { loginValidation } from '../validators/authValidator.js';

const router = Router();

router.post('/login', validate(loginValidation), authController.login);
router.get('/me', requireAuth, authController.getMe);

export default router;
