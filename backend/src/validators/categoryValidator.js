import { body } from 'express-validator';

export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required.')
    .isLength({ max: 100 })
    .withMessage('Category name must be 100 characters or less.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be 500 characters or less.'),
  body('image')
    .optional()
    .trim(),
];

export const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Category name must be 100 characters or less.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be 500 characters or less.'),
  body('image')
    .optional()
    .trim(),
];
