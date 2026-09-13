import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Generate a unique order reference (e.g., LBI-2024-A1B2C3).
 */
const generateOrderReference = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LBI-${year}-${code}`;
};

/**
 * Create a new order (checkout).
 */
export const createOrder = async (data) => {
  const {
    customerName, customerPhone, deliveryLocation,
    deliveryFee, note, items,
  } = data;

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + parseFloat(deliveryFee);

  // Generate unique reference
  let reference;
  let isUnique = false;
  while (!isUnique) {
    reference = generateOrderReference();
    const existing = await prisma.order.findUnique({ where: { reference } });
    if (!existing) isUnique = true;
  }

  const order = await prisma.order.create({
    data: {
      reference,
      customerName,
      customerPhone,
      deliveryLocation,
      deliveryFee: parseFloat(deliveryFee),
      subtotal,
      total,
      note: note || null,
      items: {
        create: items.map((item) => ({
          productName: item.productName,
          brand: item.brand,
          size: item.size || null,
          colour: item.colour || null,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          productId: item.productId || null,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return order;
};

/**
 * List orders with pagination.
 */
export const listOrders = async (query) => {
  const { status, page = 1, limit = 20 } = query;

  const where = {};
  if (status) where.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      pages: Math.ceil(total / take),
    },
  };
};

/**
 * Get a single order by ID.
 */
export const getOrder = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  return order;
};

/**
 * Update order status.
 */
export const updateOrderStatus = async (id, status) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  return prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
};

/**
 * Get order stats for dashboard.
 */
export const getOrderStats = async () => {
  const [total, pending, confirmed, completed] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'CONFIRMED' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
  ]);

  return { total, pending, confirmed, completed };
};

/**
 * Get recent orders for dashboard.
 */
export const getRecentOrders = async (limit = 5) => {
  return prisma.order.findMany({
    include: {
      items: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};
