import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Authenticate admin with email and password.
 */
export const loginAdmin = async (email, password) => {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!admin) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken(admin.id);

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  };
};

/**
 * Get admin profile by ID.
 */
export const getAdminProfile = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!admin) {
    throw new AppError('Admin not found.', 404);
  }

  return admin;
};
