import { validationResult } from 'express-validator';

/**
 * Middleware that checks express-validator results and returns
 * a 400 response with formatted errors if validation fails.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: formattedErrors,
    });
  };
};

export default validate;
