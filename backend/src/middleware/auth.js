import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import prisma from '../config/database.js';

/**
 * Middleware to protect admin-only routes.
 * Verifies JWT from Authorization header and attaches admin to request.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT token for an admin.
 */
export const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};
