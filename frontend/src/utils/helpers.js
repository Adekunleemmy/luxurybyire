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
  const { customerName, customerPhone, deliveryLocation, items, subtotal, deliveryFee, total, note } = order;

  let message = `Hello Luxurybyire,\n\nI would like to place an order.\n\n`;
  message += `*Customer:*\nName: ${customerName}\nPhone: ${customerPhone}\nDelivery Location: ${deliveryLocation}\n\n`;
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

