import multer from 'multer';
import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import r2Service from '../../services/r2Service.js';
import AppError from '../../utils/customError.js';

// Multer memory storage configuration for images (max 25MB raw upload before compression)
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = (file.originalname || '').toLowerCase();

    const isImageMime =
      mime.startsWith('image/') ||
      mime === 'application/octet-stream';

    const isImageExt = /\.(jpe?g|png|webp|gif|svg|heic|heif|avif|bmp|tiff)$/i.test(ext);

    if (isImageMime || isImageExt) {
      cb(null, true);
    } else {
      cb(
        AppError.badRequest(
          'Invalid file format. Please upload an image file (JPEG, PNG, WebP, GIF, SVG, HEIC, AVIF, etc.).'
        )
      );
    }
  },
});

export const uploadSingleImageMiddleware = imageUpload.single('image');
export const uploadMultipleImagesMiddleware = imageUpload.array('images', 15);

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

  return ApiResponse.created(res, result, 'Image optimized and uploaded successfully as WebP');
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

  return ApiResponse.created(res, { images: uploads }, `${uploads.length} images optimized and uploaded successfully`);
});

export const deleteImage = asyncHandler(async (req, res) => {
  const { key, imageUrl } = req.body;
  const target = key || imageUrl || req.query.key || req.query.imageUrl;
  if (!target) {
    throw AppError.badRequest('Must provide image key or imageUrl to delete from storage');
  }

  await r2Service.deleteImage(target);
  return ApiResponse.success(res, { deleted: true, target }, 'Image deleted from Cloudflare R2 storage');
});

export default {
  uploadSingleImageMiddleware,
  uploadMultipleImagesMiddleware,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
};
