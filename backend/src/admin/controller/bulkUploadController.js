import multer from 'multer';
import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import bulkImportService from '../../services/bulkImportService.js';
import r2Service from '../../services/r2Service.js';
import { BulkImport, AuditLog } from '../../models/index.js';
import { BULK_IMPORT_STATUS } from '../../models/BulkImport.js';
import queueService from '../../services/queueService.js';
import { QUEUE_NAMES } from '../../config/queues.js';
import AppError from '../../utils/customError.js';
import logger from '../../config/logger.js';

// Multer memory storage for Excel & Images (max 100MB combined)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024, files: 300 },
});

export const bulkFileUploadMiddleware = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(AppError.badRequest('Uploaded file exceeds the maximum allowed size (100MB limit)'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(AppError.badRequest('Too many files in upload batch (maximum 300 files allowed)'));
        }
        return next(AppError.badRequest(`Upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};

function extractUploadFiles(req) {
  let excelFile = null;
  let imageFiles = [];

  if (req.file) {
    excelFile = req.file;
  } else if (req.files) {
    if (Array.isArray(req.files)) {
      // Find Excel/CSV file by extension, mimetype or fieldname
      excelFile =
        req.files.find((f) => /\.(xlsx|xls|csv)$/i.test(f.originalname || '')) ||
        req.files.find((f) => f.fieldname === 'file') ||
        req.files.find((f) => (f.mimetype || '').includes('spreadsheet') || (f.mimetype || '').includes('excel') || (f.mimetype || '').includes('csv'));

      imageFiles = req.files.filter((f) => f !== excelFile);
    } else {
      if (req.files.file && req.files.file.length > 0) {
        excelFile = req.files.file[0];
      }
      if (req.files.images && req.files.images.length > 0) {
        imageFiles = req.files.images;
      }
    }
  }

  return { excelFile, imageFiles };
}

/**
 * GET /api/v1/admin/products/bulk/template
 * Download dynamic Excel template populated with live categories & dropdowns
 */
export const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = await bulkImportService.generateTemplate();

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="ThePurple_Product_Import_Template.xlsx"');
  res.setHeader('Content-Length', buffer.length);

  return res.end(buffer);
});

/**
 * POST /api/v1/admin/products/bulk/validate
 * Validate file and return preview without committing to database
 */
export const validateBulkFile = asyncHandler(async (req, res) => {
  const { excelFile, imageFiles } = extractUploadFiles(req);

  if (!excelFile) {
    throw AppError.badRequest('No Excel or CSV file uploaded');
  }

  const rows = bulkImportService.parseFileBuffer(excelFile.buffer);
  const validationResult = await bulkImportService.validateRows(rows, imageFiles);

  return ApiResponse.success(
    res,
    {
      fileName: excelFile.originalname,
      attachedImagesCount: imageFiles.length,
      totalRows: validationResult.totalRows,
      validCount: validationResult.validCount,
      errorCount: validationResult.errorCount,
      warningCount: validationResult.warningCount,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      preview: validationResult.validRows.slice(0, 10).map((r) => ({
        rowNumber: r.rowNumber,
        name: r.name,
        sku: r.sku,
        category: r.categoryName,
        subcategory: r.subcategoryName,
        price: r.price,
        salePrice: r.salePrice,
        stock: r.stock,
        imageMatchStatus: r.imageMatchStatus,
        status: r.status,
      })),
    },
    'File validated successfully'
  );
});

/**
 * POST /api/v1/admin/products/bulk/import
 * Commit validated bulk import, upload images to R2 if provided, and save products
 */
export const executeBulkImport = asyncHandler(async (req, res) => {
  const { excelFile, imageFiles } = extractUploadFiles(req);

  if (!excelFile) {
    throw AppError.badRequest('No spreadsheet file uploaded for import');
  }

  const rows = bulkImportService.parseFileBuffer(excelFile.buffer);
  const validationResult = await bulkImportService.validateRows(rows, imageFiles);

  if (validationResult.validCount === 0) {
    throw AppError.badRequest('No valid rows found in the uploaded file. Please review the errors.');
  }

  // Upload any attached image files to Cloudflare R2 before processing (concurrent chunked upload)
  if (imageFiles.length > 0) {
    logger.info(`Bulk import: Uploading ${imageFiles.length} attached images to Cloudflare R2...`);
    const imageUploadMap = new Map();

    const chunkSize = 6;
    for (let i = 0; i < imageFiles.length; i += chunkSize) {
      const chunk = imageFiles.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (img) => {
          try {
            const uploadResult = await r2Service.uploadImage(img.buffer, img.originalname, img.mimetype, 'products');
            const url = uploadResult?.imageUrl || uploadResult?.publicUrl || uploadResult?.url;
            if (url) {
              const orig = (img.originalname || '').toLowerCase().trim();
              imageUploadMap.set(orig, url);
              const withoutExt = orig.substring(0, orig.lastIndexOf('.')) || orig;
              imageUploadMap.set(withoutExt, url);
              logger.info(`[Bulk Import R2] Uploaded image "${img.originalname}" -> ${url}`);
            }
          } catch (err) {
            logger.warn(`Failed to upload attached image ${img.originalname}: ${err.message}`);
          }
        })
      );
    }

    // Attach uploaded public URLs to valid rows
    validationResult.validRows.forEach((row) => {
      const allUrls = [...(row.allImageUrls || [])];

      // 1. Matched image files
      if (row.matchedImageFiles && row.matchedImageFiles.length > 0) {
        row.matchedImageFiles.forEach((f) => {
          const orig = (f.originalname || '').toLowerCase().trim();
          const withoutExt = orig.substring(0, orig.lastIndexOf('.')) || orig;
          const url = imageUploadMap.get(orig) || imageUploadMap.get(withoutExt);
          if (url && !allUrls.includes(url)) {
            allUrls.push(url);
          }
        });
      }

      // 2. Filenames specified in Excel column
      if (row.rawImage) {
        const items = String(row.rawImage)
          .split(/[,;\n|]+/)
          .map((s) => s.trim())
          .filter(Boolean);

        items.forEach((item) => {
          if (item.startsWith('http://') || item.startsWith('https://')) {
            if (!allUrls.includes(item)) allUrls.push(item);
          } else {
            const key = item.toLowerCase();
            const withoutExt = key.substring(0, key.lastIndexOf('.')) || key;
            const url = imageUploadMap.get(key) || imageUploadMap.get(withoutExt);
            if (url && !allUrls.includes(url)) {
              allUrls.push(url);
            }
          }
        });
      }

      // 3. Match SKU filename
      if (row.sku) {
        const skuKey = String(row.sku).toLowerCase().trim();
        const skuUrl = imageUploadMap.get(skuKey);
        if (skuUrl && !allUrls.includes(skuUrl)) {
          allUrls.push(skuUrl);
        }
        for (let idx = 1; idx <= 10; idx++) {
          const variantSkuUrl = imageUploadMap.get(`${skuKey}-${idx}`);
          if (variantSkuUrl && !allUrls.includes(variantSkuUrl)) {
            allUrls.push(variantSkuUrl);
          }
        }
      }

      if (allUrls.length > 0) {
        row.primaryImageUrl = allUrls[0];
        row.allImageUrls = allUrls;
      }

      // Delete temporary buffer references before passing to queue
      delete row.matchedImageFiles;
      delete row.attachedImageFile;
    });
  } else {
    // Clean temporary properties
    validationResult.validRows.forEach((row) => {
      delete row.matchedImageFiles;
      delete row.attachedImageFile;
    });
  }

  // Create BulkImport record
  const bulkImport = await BulkImport.create({
    adminId: req.admin.id,
    fileName: excelFile.originalname,
    status: BULK_IMPORT_STATUS.VALIDATING,
    totalRows: validationResult.totalRows,
    validRows: validationResult.validCount,
    errorRows: validationResult.errorCount,
    processedRows: 0,
    createdCount: 0,
    failedCount: 0,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
  });

  // Enqueue background BullMQ job or execute fallback
  let queuedInBackground = false;
  try {
    await queueService.addJob(
      QUEUE_NAMES.BULK_IMPORT,
      `bulk-import-${bulkImport.id}`,
      {
        validRows: validationResult.validRows,
        bulkImportId: bulkImport.id,
        adminId: req.admin.id,
      }
    );
    queuedInBackground = true;
    logger.info(`Enqueued bulk import job ${bulkImport.id} to BullMQ queue`);
  } catch (queueErr) {
    logger.warn(`BullMQ queue offline; executing in async non-blocking background: ${queueErr.message}`);
    setImmediate(() => {
      bulkImportService
        .processImportBatch(validationResult.validRows, bulkImport.id, req.admin.id)
        .catch((err) => logger.error(`Fallback bulk import error: ${err.message}`));
    });
  }

  await AuditLog.create({
    adminId: req.admin.id,
    action: 'BULK_IMPORT_STARTED',
    entity: 'BulkImport',
    entityId: bulkImport.id,
    metadata: {
      fileName: excelFile.originalname,
      totalRows: validationResult.totalRows,
      validRows: validationResult.validCount,
      attachedImagesCount: imageFiles.length,
    },
  });

  return ApiResponse.accepted(
    res,
    {
      importId: bulkImport.id,
      fileName: excelFile.originalname,
      status: BULK_IMPORT_STATUS.PROCESSING,
      totalRows: validationResult.totalRows,
      validRows: validationResult.validCount,
      errorRows: validationResult.errorCount,
      attachedImagesCount: imageFiles.length,
      queuedInBackground,
    },
    'Bulk import started successfully. Products and gallery images are being imported into database & search index.'
  );
});

/**
 * GET /api/v1/admin/products/bulk/jobs/:id
 * Check progress of a bulk import job
 */
export const getImportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bulkImport = await BulkImport.findByPk(id);
  if (!bulkImport) {
    throw AppError.notFound('Bulk import job not found');
  }

  return ApiResponse.success(res, { job: bulkImport }, 'Import job status retrieved');
});

/**
 * GET /api/v1/admin/products/bulk/history
 * List past bulk imports
 */
export const listImportHistory = asyncHandler(async (req, res) => {
  const imports = await BulkImport.findAll({
    order: [['createdAt', 'DESC']],
    limit: 20,
  });

  return ApiResponse.success(res, { imports }, 'Import history retrieved');
});

export default {
  bulkFileUploadMiddleware,
  downloadTemplate,
  validateBulkFile,
  executeBulkImport,
  getImportStatus,
  listImportHistory,
};
