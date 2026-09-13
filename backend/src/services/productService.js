import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import slugify from 'slugify';

const productIncludes = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' } },
  sizes: { orderBy: { size: 'asc' } },
  colours: true,
};

/**
 * List products with filtering, search, sorting, and pagination.
 */
export const listProducts = async (query) => {
  const {
    search,
    category,
    brand,
    gender,
    minPrice,
    maxPrice,
    size,
    inStock,
    isSale,
    isFeatured,
    isNewArrival,
    sort = 'featured',
    page = 1,
    limit = 12,
  } = query;

  const where = { isAvailable: true };

  // Search across name, brand, description
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Category filter (by slug)
  if (category) {
    where.category = { slug: category };
  }

  // Brand filter
  if (brand) {
    where.brand = { equals: brand, mode: 'insensitive' };
  }

  // Gender filter
  if (gender) {
    where.gender = gender.toUpperCase();
  }

  // Price range
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  // Size filter
  if (size) {
    where.sizes = { some: { size: size } };
  }

  // Stock filter
  if (inStock === 'true') {
    where.stockQuantity = { gt: 0 };
  }

  // Boolean flags
  if (isSale === 'true') where.isSale = true;
  if (isFeatured === 'true') where.isFeatured = true;
  if (isNewArrival === 'true') where.isNewArrival = true;

  // Sorting
  let orderBy;
  switch (sort) {
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'featured':
    default:
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
      break;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productIncludes,
      orderBy,
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      pages: Math.ceil(total / take),
    },
  };
};

/**
 * List ALL products for admin (including unavailable).
 */
export const listAllProducts = async (query) => {
  const { search, page = 1, limit = 20 } = query;

  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productIncludes,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      pages: Math.ceil(total / take),
    },
  };
};

/**
 * Get a single product by ID or slug.
 */
export const getProduct = async (idOrSlug) => {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: productIncludes,
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return product;
};

/**
 * Get related products (same category, excluding current).
 */
export const getRelatedProducts = async (productId, categoryId, limit = 4) => {
  return prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      isAvailable: true,
      stockQuantity: { gt: 0 },
    },
    include: productIncludes,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Create a new product.
 */
export const createProduct = async (data) => {
  const {
    name, brand, description, price, previousPrice,
    gender, stockQuantity, categoryId, sizes, colours,
    isFeatured, isNewArrival, isSale, images,
  } = data;

  // Generate unique slug
  let slug = slugify(name, { lower: true, strict: true });
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // Verify category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new AppError('Category not found.', 400);
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      brand,
      description,
      price: parseFloat(price),
      previousPrice: previousPrice ? parseFloat(previousPrice) : null,
      gender: gender || 'UNISEX',
      stockQuantity: parseInt(stockQuantity) || 0,
      isFeatured: isFeatured || false,
      isNewArrival: isNewArrival || false,
      isSale: isSale || false,
      isAvailable: parseInt(stockQuantity) > 0,
      categoryId,
      sizes: {
        create: (sizes || []).map((s) => ({ size: String(s) })),
      },
      colours: {
        create: (colours || []).filter(c => c).map((c) => ({ colour: c })),
      },
      images: {
        create: (images || []).map((img, index) => ({
          url: img.url,
          publicId: img.publicId || null,
          isPrimary: index === 0,
          sortOrder: index,
        })),
      },
    },
    include: productIncludes,
  });

  return product;
};

/**
 * Update an existing product.
 */
export const updateProduct = async (id, data) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Product not found.', 404);
  }

  const {
    name, brand, description, price, previousPrice,
    gender, stockQuantity, categoryId, sizes, colours,
    isFeatured, isNewArrival, isSale, isAvailable, images,
  } = data;

  // Build update data
  const updateData = {};

  if (name !== undefined) {
    updateData.name = name;
    // Regenerate slug if name changed
    let slug = slugify(name, { lower: true, strict: true });
    const existingSlug = await prisma.product.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    updateData.slug = slug;
  }

  if (brand !== undefined) updateData.brand = brand;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (previousPrice !== undefined) updateData.previousPrice = previousPrice ? parseFloat(previousPrice) : null;
  if (gender !== undefined) updateData.gender = gender;
  if (categoryId !== undefined) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError('Category not found.', 400);
    updateData.categoryId = categoryId;
  }
  if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
  if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival;
  if (isSale !== undefined) updateData.isSale = isSale;

  if (stockQuantity !== undefined) {
    const qty = parseInt(stockQuantity);
    updateData.stockQuantity = qty;
    // Auto-update availability based on stock
    if (isAvailable === undefined) {
      updateData.isAvailable = qty > 0;
    }
  }

  if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

  // Use a transaction for atomic updates with relations
  const product = await prisma.$transaction(async (tx) => {
    // Update sizes if provided
    if (sizes !== undefined) {
      await tx.productSize.deleteMany({ where: { productId: id } });
      if (sizes.length > 0) {
        await tx.productSize.createMany({
          data: sizes.map((s) => ({ size: String(s), productId: id })),
        });
      }
    }

    // Update colours if provided
    if (colours !== undefined) {
      await tx.productColour.deleteMany({ where: { productId: id } });
      if (colours.filter(c => c).length > 0) {
        await tx.productColour.createMany({
          data: colours.filter(c => c).map((c) => ({ colour: c, productId: id })),
        });
      }
    }

    // Update images if provided
    if (images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            url: img.url,
            publicId: img.publicId || null,
            isPrimary: img.isPrimary || index === 0,
            sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
            productId: id,
          })),
        });
      }
    }

    // Update product
    return tx.product.update({
      where: { id },
      data: updateData,
      include: productIncludes,
    });
  });

  return product;
};

/**
 * Delete a product.
 */
export const deleteProduct = async (id) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Product not found.', 404);
  }

  await prisma.product.delete({ where: { id } });
  return { message: 'Product deleted successfully.' };
};

/**
 * Get product stats for admin dashboard.
 */
export const getProductStats = async () => {
  const [total, inStock, outOfStock, featured] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { stockQuantity: { gt: 0 } } }),
    prisma.product.count({ where: { stockQuantity: { equals: 0 } } }),
    prisma.product.count({ where: { isFeatured: true } }),
  ]);

  return { total, inStock, outOfStock, featured };
};

/**
 * Get distinct brands for filtering.
 */
export const getBrands = async () => {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' },
  });

  return products.map((p) => p.brand);
};
