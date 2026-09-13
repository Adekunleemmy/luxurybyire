import { body } from 'express-validator';

export const updateSettingsValidation = [
  body('businessName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Business name cannot be empty.'),
  body('whatsappNumber')
    .optional()
    .trim()
    .matches(/^\d{10,15}$/)
    .withMessage('WhatsApp number must be 10-15 digits in international format without + or spaces.'),
  body('phone')
    .optional()
    .trim(),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.'),
  body('address')
    .optional()
    .trim(),
  body('instagramUrl')
    .optional()
    .trim(),
  body('tiktokUrl')
    .optional()
    .trim(),
  body('facebookUrl')
    .optional()
    .trim(),
];

export const updateDeliveryZonesValidation = [
  body('zones')
    .isArray({ min: 1 })
    .withMessage('At least one delivery zone is required.'),
  body('zones.*.id')
    .optional(),
  body('zones.*.name')
    .trim()
    .notEmpty()
    .withMessage('Zone name is required.'),
  body('zones.*.fee')
    .isFloat({ min: 0 })
    .withMessage('Fee must be a positive number.'),
  body('zones.*.description')
    .optional()
    .trim(),
];
