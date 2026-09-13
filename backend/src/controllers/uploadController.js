import * as cloudinaryService from '../services/cloudinaryService.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided.',
      });
    }

    const result = await cloudinaryService.uploadImage(req.file.buffer, {
      folder: req.body.folder || 'luxurybyire/products',
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided.',
      });
    }

    const uploadPromises = req.files.map((file) =>
      cloudinaryService.uploadImage(file.buffer, {
        folder: req.body.folder || 'luxurybyire/products',
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Image public ID is required.',
      });
    }

    // Cloudinary public IDs can contain slashes, so reconstruct from path
    const fullPublicId = req.params[0] || publicId;

    await cloudinaryService.deleteImage(fullPublicId);

    res.json({
      success: true,
      message: 'Image deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
