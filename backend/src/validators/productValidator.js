import { body } from 'express-validator';

export const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required.')
    .isLength({ max: 200 })
    .withMessage('Product name must be 200 characters or less.'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required.')
    .isLength({ max: 100 })
    .withMessage('Brand must be 100 characters or less.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('previousPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Previous price must be a positive number.'),
  body('gender')
    .isIn(['MEN', 'WOMEN', 'UNISEX'])
    .withMessage('Gender must be Men, Women, or Unisex.'),
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be 0 or more.'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required.'),
  body('sizes')
    .isArray({ min: 1 })
    .withMessage('At least one size is required.'),
  body('sizes.*')
    .trim()
    .notEmpty()
    .withMessage('Size value cannot be empty.'),
  body('colours')
    .optional()
    .isArray()
    .withMessage('Colours must be an array.'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be true or false.'),
  body('isNewArrival')
    .optional()
    .isBoolean()
    .withMessage('New arrival must be true or false.'),
  body('isSale')
    .optional()
    .isBoolean()
    .withMessage('Sale must be true or false.'),
];

export const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty.')
    .isLength({ max: 200 })
    .withMessage('Product name must be 200 characters or less.'),
  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand cannot be empty.'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty.'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('previousPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Previous price must be a positive number.'),
  body('gender')
    .optional()
    .isIn(['MEN', 'WOMEN', 'UNISEX'])
    .withMessage('Gender must be Men, Women, or Unisex.'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be 0 or more.'),
  body('categoryId')
    .optional()
    .notEmpty()
    .withMessage('Category cannot be empty.'),
  body('sizes')
    .optional()
    .isArray()
    .withMessage('Sizes must be an array.'),
  body('colours')
    .optional()
    .isArray()
    .withMessage('Colours must be an array.'),
];
