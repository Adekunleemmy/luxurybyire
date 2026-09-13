import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach JWT for admin requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxurybyire_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear token and redirect if on admin pages
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      if (isAdminRoute && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('luxurybyire_admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── API Methods ────────────────────────────────────────

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (slug) => api.get(`/products/${slug}`);
export const getBrands = () => api.get('/products/brands');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Admin products (includes unavailable)
export const getAdminProducts = (params) => api.get('/admin/products', { params });

// Categories
export const getCategories = () => api.get('/categories');
export const getCategory = (slug) => api.get(`/categories/${slug}`);
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const getOrderStats = () => api.get('/orders/stats');
export const getRecentOrders = () => api.get('/orders/recent');

// Auth
export const loginAdmin = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
export const getDeliveryZones = () => api.get('/settings/delivery-zones');
export const updateDeliveryZones = (zones) => api.put('/settings/delivery-zones', { zones });

// Dashboard
export const getDashboardStats = () => api.get('/admin/stats');
export const getProductStats = () => api.get('/products/stats');

// Upload
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadMultipleImages = (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteImage = (publicId) => api.delete(`/upload/${publicId}`);

export default api;
