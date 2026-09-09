import multer from 'multer';
import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import r2Service from '../../services/r2Service.js';
import AppError from '../../utils/customError.js';

// Multer memory storage configuration for images (max 10MB)
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(AppError.badRequest('Invalid file format. Only JPEG, PNG, WEBP, and GIF images are allowed.'));
    }
  },
});

export const uploadSingleImageMiddleware = imageUpload.single('image');
export const uploadMultipleImagesMiddleware = imageUpload.array('images', 10);

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw AppError.badRequest('No image file uploaded');
  }

  const { folder = 'products' } = req.body;
  const result = await r2Service.uploadImage(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    folder
  );

  return ApiResponse.created(res, result, 'Image uploaded successfully');
});

export const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw AppError.badRequest('No image files uploaded');
  }

  const { folder = 'products' } = req.body;
  const uploads = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const uploaded = await r2Service.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );
    uploads.push({
      ...uploaded,
      isPrimary: i === 0,
      displayOrder: i,
    });
  }

  return ApiResponse.created(res, { images: uploads }, `${uploads.length} images uploaded successfully`);
});

export default {
  uploadSingleImageMiddleware,
  uploadMultipleImagesMiddleware,
  uploadImage,
  uploadMultipleImages,
};
