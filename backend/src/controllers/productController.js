import * as productService from '../services/productService.js';

export const listProducts = async (req, res, next) => {
  try {
    const result = await productService.listProducts(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listAllProducts = async (req, res, next) => {
  try {
    const result = await productService.listAllProducts(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.idOrSlug);
    const related = await productService.getRelatedProducts(product.id, product.categoryId);

    res.json({
      success: true,
      data: { product, related },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getProductStats = async (req, res, next) => {
  try {
    const stats = await productService.getProductStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await productService.getBrands();
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};
