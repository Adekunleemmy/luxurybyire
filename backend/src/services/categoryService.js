import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import slugify from 'slugify';

/**
 * List all categories.
 */
export const listCategories = async () => {
  return prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });
};

/**
 * Get a single category by ID or slug.
 */
export const getCategory = async (idOrSlug) => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: {
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  return category;
};

/**
 * Create a new category.
 */
export const createCategory = async (data) => {
  const { name, description, image } = data;

  let slug = slugify(name, { lower: true, strict: true });
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return prisma.category.create({
    data: {
      name,
      slug,
      description: description || null,
      image: image || null,
    },
    include: {
      _count: { select: { products: true } },
    },
  });
};

/**
 * Update a category.
 */
export const updateCategory = async (id, data) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
    let slug = slugify(data.name, { lower: true, strict: true });
    const existingSlug = await prisma.category.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    updateData.slug = slug;
  }

  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;

  return prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      _count: { select: { products: true } },
    },
  });
};

/**
 * Delete a category. Prevents deletion if products exist.
 */
export const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  if (category._count.products > 0) {
    throw new AppError(
      `Cannot delete "${category.name}" because it has ${category._count.products} product(s). Please move or delete those products first.`,
      400
    );
  }

  await prisma.category.delete({ where: { id } });
  return { message: 'Category deleted successfully.' };
};
