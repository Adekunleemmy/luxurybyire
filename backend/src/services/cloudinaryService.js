import cloudinary from '../config/cloudinary.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Upload an image buffer to Cloudinary.
 */
export const uploadImage = async (fileBuffer, options = {}) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'luxurybyire/products',
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, height: 1200, crop: 'limit' },
          ],
          ...options,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new AppError('Failed to upload image. Please try again.', 500);
  }
};

/**
 * Delete an image from Cloudinary.
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new AppError('Failed to delete image.', 500);
  }
};

/**
 * Generate an optimized Cloudinary URL with transformations.
 */
export const getOptimizedUrl = (publicId, options = {}) => {
  const { width = 800, height = 800, crop = 'fill' } = options;

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width, height, crop, gravity: 'auto' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};
