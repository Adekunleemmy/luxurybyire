import { Router } from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateSettingsValidation, updateDeliveryZonesValidation } from '../validators/settingsValidator.js';

const router = Router();

// Public routes (storefront needs business info and delivery zones)
router.get('/', settingsController.getSettings);
router.get('/delivery-zones', settingsController.getDeliveryZones);

// Admin routes
router.put('/', requireAuth, validate(updateSettingsValidation), settingsController.updateSettings);
router.put('/delivery-zones', requireAuth, validate(updateDeliveryZonesValidation), settingsController.updateDeliveryZones);

export default router;
