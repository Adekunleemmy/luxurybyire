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
    customerName, customerPhone, deliveryAddress, deliveryLocation,
    deliveryFee, note, items,
  } = data;

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
  const total = subtotal + (parseFloat(deliveryFee) || 0);

  // Validate productIds to ensure foreign key integrity
  const productIds = items.map((i) => i.productId).filter(Boolean);
  let validProductIds = new Set();
  try {
    if (productIds.length > 0) {
      const existing = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      validProductIds = new Set(existing.map((p) => p.id));
    }
  } catch (err) {
    console.error('Failed to verify product IDs:', err);
  }

  // Generate unique reference
  let reference;
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    attempts++;
    reference = generateOrderReference();
    const existing = await prisma.order.findUnique({ where: { reference } });
    if (!existing) isUnique = true;
  }
  if (!reference) {
    reference = `LBI-${Date.now()}`;
  }

  const orderItemsData = items.map((item) => ({
    productName: item.productName || 'Product',
    brand: item.brand || 'Luxurybyire',
    size: item.size || null,
    colour: item.colour || null,
    quantity: parseInt(item.quantity) || 1,
    price: parseFloat(item.price) || 0,
    productId: validProductIds.has(item.productId) ? item.productId : null,
  }));

  try {
    const order = await prisma.order.create({
      data: {
        reference,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress?.trim() || null,
        deliveryLocation,
        deliveryFee: parseFloat(deliveryFee) || 0,
        subtotal,
        total,
        note: note?.trim() || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  } catch (err) {
    // If column deliveryAddress does not exist in production database yet (P2022)
    if (err.code === 'P2022') {
      console.warn('deliveryAddress column missing, attempting auto-migration...');
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT;`);
        return await prisma.order.create({
          data: {
            reference,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryAddress: deliveryAddress?.trim() || null,
            deliveryLocation,
            deliveryFee: parseFloat(deliveryFee) || 0,
            subtotal,
            total,
            note: note?.trim() || null,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: true,
          },
        });
      } catch (retryErr) {
        console.error('Retry with added column failed:', retryErr);
      }
    }
    throw err;
  }
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
