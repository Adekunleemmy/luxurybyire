import env from '../config/env.js';

/**
 * Global error handler.
 * Returns clean JSON responses — never exposes stack traces to clients.
 */
const errorHandler = (err, req, res, _next) => {
  // Log full error in development
  if (env.isDev) {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with that value already exists.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Cannot complete this action because related records exist.',
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File is too large. Maximum size is 5MB.',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file upload field.',
    });
  }

  // Custom application errors
  const statusCode = err.statusCode || 500;
  const message = err.statusCode
    ? err.message
    : 'Something went wrong. Please try again later.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDev && { stack: err.stack }),
  });
};

/**
 * Custom application error class.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default errorHandler;
