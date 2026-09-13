import { body } from 'express-validator';

export const createOrderValidation = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Your name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  body('customerPhone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^(\+?234|0)[789]\d{9}$/)
    .withMessage('Please enter a valid Nigerian phone number.'),
  body('deliveryLocation')
    .trim()
    .notEmpty()
    .withMessage('Delivery location is required.'),
  body('deliveryFee')
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number.'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be 500 characters or less.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required.'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item.'),
  body('items.*.productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required for each item.'),
  body('items.*.brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required for each item.'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1.'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('items.*.size')
    .optional()
    .trim(),
  body('items.*.colour')
    .optional()
    .trim(),
];

export const updateOrderStatusValidation = [
  body('status')
    .isIn(['PENDING', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid order status.'),
];
