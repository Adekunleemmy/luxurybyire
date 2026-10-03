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

  // Only available products that have positive stock reflect in the customer shop
  const where = {
    isAvailable: true,
    stockQuantity: { gt: 0 },
  };

  const andConditions = [];

  // Search across name, brand, description
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  // Category filter (by slug, id, or name)
  if (category) {
    where.category = {
      OR: [
        { slug: { equals: category, mode: 'insensitive' } },
        { id: category },
        { name: { equals: category, mode: 'insensitive' } },
      ],
    };
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

  // Boolean flags
  if (isSale === 'true') {
    andConditions.push({
      OR: [
        { isSale: true },
        { previousPrice: { not: null } },
      ],
    });
  }

  if (isNewArrival === 'true') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    andConditions.push({
      OR: [
        { isNewArrival: true },
        { createdAt: { gte: thirtyDaysAgo } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  if (isFeatured === 'true') {
    const featuredCount = await prisma.product.count({
      where: { ...where, isFeatured: true },
    });
    if (featuredCount > 0) {
      where.isFeatured = true;
    }
  }

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
    isFeatured, isNewArrival, isSale, isAvailable, images,
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

  const numPrice = parseFloat(price);
  const numPrevPrice = previousPrice ? parseFloat(previousPrice) : null;
  const numStock = stockQuantity !== undefined ? parseInt(stockQuantity) : 10;
  const available = isAvailable !== undefined ? Boolean(isAvailable) : (numStock > 0);
  const autoSale = numPrevPrice !== null && numPrevPrice > numPrice;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      brand,
      description,
      price: numPrice,
      previousPrice: numPrevPrice,
      gender: gender || 'UNISEX',
      stockQuantity: available ? (numStock > 0 ? numStock : 10) : 0,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      isSale: isSale !== undefined ? Boolean(isSale) : autoSale,
      isAvailable: available,
      categoryId,
      sizes: {
        create: (sizes || []).map((s) => ({ size: String(s) })),
      },
      colours: {
        create: (colours || []).filter(c => c).map((c) => ({ colour: c })),
      },
      images: {
        create: (images || []).length > 0
          ? [
              { ...images[images.findIndex(img => Boolean(img.isPrimary)) !== -1 ? images.findIndex(img => Boolean(img.isPrimary)) : 0], isPrimary: true, sortOrder: 0 },
              ...images.filter((_, i) => i !== (images.findIndex(img => Boolean(img.isPrimary)) !== -1 ? images.findIndex(img => Boolean(img.isPrimary)) : 0)).map((img, i) => ({
                ...img,
                isPrimary: false,
                sortOrder: i + 1,
              })),
            ].map(img => ({
              url: img.url,
              publicId: img.publicId || null,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
            }))
          : [],
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

  if (isAvailable !== undefined) {
    const avail = Boolean(isAvailable);
    updateData.isAvailable = avail;
    if (avail && (stockQuantity === undefined && existing.stockQuantity === 0)) {
      updateData.stockQuantity = 10;
    } else if (!avail && stockQuantity === undefined) {
      updateData.stockQuantity = 0;
    }
  }

  if (stockQuantity !== undefined) {
    const qty = parseInt(stockQuantity);
    updateData.stockQuantity = qty;
    if (isAvailable === undefined) {
      updateData.isAvailable = qty > 0;
    }
  }

  if (price !== undefined || previousPrice !== undefined) {
    const effPrice = price !== undefined ? parseFloat(price) : existing.price;
    const effPrev = previousPrice !== undefined ? (previousPrice ? parseFloat(previousPrice) : null) : existing.previousPrice;
    if (isSale === undefined) {
      updateData.isSale = Boolean(effPrev && effPrev > effPrice);
    }
  }

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
        const primaryIdx = images.findIndex((img) => Boolean(img.isPrimary));
        const effectivePrimaryIdx = primaryIdx !== -1 ? primaryIdx : 0;
        const sortedImagesList = [
          { ...images[effectivePrimaryIdx], isPrimary: true, sortOrder: 0 },
          ...images.filter((_, i) => i !== effectivePrimaryIdx).map((img, i) => ({
            ...img,
            isPrimary: false,
            sortOrder: i + 1,
          })),
        ];

        await tx.productImage.createMany({
          data: sortedImagesList.map((img) => ({
            url: img.url,
            publicId: img.publicId || null,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
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
 * Get distinct brands for filtering from available store inventory.
 */
export const getBrands = async () => {
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      brand: { not: '' },
    },
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' },
  });

  const uniqueMap = new Map();
  products.forEach((p) => {
    const trimmed = p.brand?.trim();
    if (trimmed && !uniqueMap.has(trimmed.toLowerCase())) {
      uniqueMap.set(trimmed.toLowerCase(), trimmed);
    }
  });

  return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
};
