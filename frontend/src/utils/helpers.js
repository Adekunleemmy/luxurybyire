/**
 * Format a number as Nigerian Naira.
 */
export const formatPrice = (amount) => {
  if (amount == null) return '';
  return `₦${Number(amount).toLocaleString('en-NG')}`;
};

/**
 * Calculate discount percentage.
 */
export const calcDiscount = (currentPrice, previousPrice) => {
  if (!previousPrice || previousPrice <= currentPrice) return 0;
  return Math.round(((previousPrice - currentPrice) / previousPrice) * 100);
};

/**
 * Format date for display.
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time.
 */
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get human-readable order status.
 */
export const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'Pending',
    CONTACTED: 'Contacted',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

/**
 * Get gender label.
 */
export const getGenderLabel = (gender) => {
  const labels = {
    MEN: 'Men',
    WOMEN: 'Women',
    UNISEX: 'Unisex',
  };
  return labels[gender] || gender;
};

/**
 * Generate WhatsApp URL with formatted order message.
 */
export const generateWhatsAppUrl = (whatsappNumber, order) => {
  const { customerName, customerPhone, deliveryAddress, deliveryLocation, items, subtotal, deliveryFee, total, note } = order;

  let message = `Hello Luxurybyire,\n\nI would like to place an order.\n\n`;
  message += `*Customer:*\nName: ${customerName}\nPhone: ${customerPhone}\n`;
  if (deliveryAddress) {
    message += `Address: ${deliveryAddress}\n`;
  }
  message += `Delivery Location: ${deliveryLocation}\n\n`;
  message += `*Order:*\n`;

  items.forEach((item, index) => {
    message += `\n${index + 1}. ${item.productName}`;
    if (item.size) message += `\n   Size: ${item.size}`;
    if (item.colour) message += `\n   Colour: ${item.colour}`;
    message += `\n   Quantity: ${item.quantity}`;
    message += `\n   Price: ${formatPrice(item.price * item.quantity)}`;
  });

  message += `\n\nSubtotal: ${formatPrice(subtotal)}`;
  message += `\nDelivery: ${formatPrice(deliveryFee)}`;
  message += `\n*Total: ${formatPrice(total)}*`;

  if (note) {
    message += `\n\nNote: ${note}`;
  }

  message += `\n\nThank you.`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
};

/**
 * Truncate text to a max length.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
};

/**
 * Get API error message.
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return error.response.data.errors.map((e) => e.message).join('. ');
  }
  if (error.message === 'Network Error') return 'Unable to connect to server. Please check your connection.';
  return 'Something went wrong. Please try again.';
};

/**
 * Format image URL with Cloudinary optimization transformations if applicable.
 */
export const getOptimizedImageUrl = (url, width = 800) => {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('/upload/f_auto') || url.includes('/upload/w_') || url.includes('/upload/c_')) {
      return url;
    }
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return url;
};

/**
 * Record user browsing interaction for smart recommendations.
 */
export const recordProductInteraction = (product) => {
  if (!product) return;
  try {
    if (product.category?.slug) {
      const stored = JSON.parse(localStorage.getItem('luxurybyire_viewed_cats') || '[]');
      const updated = [product.category.slug, ...stored.filter((c) => c !== product.category.slug)].slice(0, 5);
      localStorage.setItem('luxurybyire_viewed_cats', JSON.stringify(updated));
    }
    if (product.brand) {
      const stored = JSON.parse(localStorage.getItem('luxurybyire_viewed_brands') || '[]');
      const updated = [product.brand.toLowerCase(), ...stored.filter((b) => b !== product.brand.toLowerCase())].slice(0, 5);
      localStorage.setItem('luxurybyire_viewed_brands', JSON.stringify(updated));
    }
  } catch (e) {}
};

/**
 * Check if a product is considered a "New Arrival" (within 30 days).
 */
export const isProductNew = (createdAt, isNewArrivalFlag) => {
  if (createdAt) {
    const diffDays = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }
  return Boolean(isNewArrivalFlag);
};

/**
 * Map a colour name (e.g., 'White', 'Black', 'Cherry Red', 'White/Black') to a CSS color or gradient.
 */
export const getColorCode = (colourName) => {
  if (!colourName || typeof colourName !== 'string') return '#94a3b8';
  const trimmed = colourName.trim();

  // If already a valid hex, rgb, or hsl
  if (trimmed.startsWith('#') || trimmed.startsWith('rgb') || trimmed.startsWith('hsl')) {
    return trimmed;
  }

  // Handle split colors like "White/Black", "White / Green", "Navy/White"
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').map((p) => p.trim());
    if (parts.length >= 2) {
      const c1 = getColorCode(parts[0]);
      const c2 = getColorCode(parts[1]);
      return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }
  }

  const key = trimmed.toLowerCase();
  const COLOR_MAP = {
    white: '#ffffff',
    black: '#111111',
    grey: '#8a8d91',
    gray: '#8a8d91',
    'light grey': '#d1d5db',
    'light gray': '#d1d5db',
    'dark grey': '#4b5563',
    'dark gray': '#4b5563',
    navy: '#0f172a',
    'navy blue': '#0f172a',
    blue: '#2563eb',
    'royal blue': '#1d4ed8',
    'sky blue': '#38bdf8',
    'light blue': '#7dd3fc',
    red: '#dc2626',
    crimson: '#991b1b',
    'cherry red': '#881337',
    burgundy: '#800020',
    maroon: '#7f1d1d',
    wine: '#722f37',
    green: '#16a34a',
    'forest green': '#14532d',
    'dark green': '#14532d',
    olive: '#65a30d',
    yellow: '#facc15',
    gold: '#d97706',
    orange: '#ea580c',
    brown: '#78350f',
    tan: '#d2b48c',
    wheat: '#f5deb3',
    beige: '#f5f5dc',
    cream: '#fef3c7',
    nude: '#e8beac',
    parchment: '#f1ebd9',
    pink: '#ec4899',
    'light pink': '#fbcfe8',
    rose: '#f43f5e',
    purple: '#9333ea',
    violet: '#7c3aed',
    silver: '#cbd5e1',
    teal: '#0d9488',
    bronze: '#cd7f32',
    coral: '#f87171',
    charcoal: '#334155',
    multi: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 50%, #10b981 100%)',
    multicolor: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 50%, #10b981 100%)',
    'multi-color': 'linear-gradient(135deg, #ef4444 0%, #3b82f6 50%, #10b981 100%)',
    'multi-colour': 'linear-gradient(135deg, #ef4444 0%, #3b82f6 50%, #10b981 100%)',
  };

  return COLOR_MAP[key] || key;
};


