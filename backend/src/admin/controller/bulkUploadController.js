import multer from 'multer';
import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import bulkImportService from '../../services/bulkImportService.js';
import { BulkImport, AuditLog } from '../../models/index.js';
import { BULK_IMPORT_STATUS } from '../../models/BulkImport.js';
import queueService from '../../services/queueService.js';
import { QUEUE_NAMES } from '../../config/queues.js';
import AppError from '../../utils/customError.js';
import logger from '../../config/logger.js';

// Multer memory storage for Excel / CSV files (max 25MB)
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const lowerName = file.originalname.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(AppError.badRequest('Invalid file format. Please upload an .xlsx, .xls, or .csv file.'));
    }
  },
});

export const bulkFileUploadMiddleware = fileUpload.single('file');

/**
 * GET /api/v1/admin/products/bulk/template
 * Download sample Excel template
 */
export const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = bulkImportService.generateTemplate();

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
  if (!req.file) {
    throw AppError.badRequest('No Excel or CSV file uploaded');
  }

  const rows = bulkImportService.parseFileBuffer(req.file.buffer);
  const validationResult = await bulkImportService.validateRows(rows);

  return ApiResponse.success(
    res,
    {
      fileName: req.file.originalname,
      totalRows: validationResult.totalRows,
      validCount: validationResult.validCount,
      errorCount: validationResult.errorCount,
      warningCount: validationResult.warningCount,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      preview: validationResult.validRows.slice(0, 5), // Preview first 5 rows
    },
    'File validated successfully'
  );
});

/**
 * POST /api/v1/admin/products/bulk/import
 * Commit validated bulk import and enqueue background BullMQ job
 */
export const executeBulkImport = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw AppError.badRequest('No file uploaded for import');
  }

  const rows = bulkImportService.parseFileBuffer(req.file.buffer);
  const validationResult = await bulkImportService.validateRows(rows);

  if (validationResult.validCount === 0) {
    throw AppError.badRequest('No valid rows found in the uploaded file. Please review the errors.');
  }

  // Create BulkImport record
  const bulkImport = await BulkImport.create({
    adminId: req.admin.id,
    fileName: req.file.originalname,
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

  // Attempt to enqueue to BullMQ queue
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
    logger.warn(`Redis/BullMQ offline; falling back to asynchronous non-blocking processing: ${queueErr.message}`);
    // Fallback: run in background tick without blocking HTTP response
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
      fileName: req.file.originalname,
      totalRows: validationResult.totalRows,
      validRows: validationResult.validCount,
    },
  });

  return ApiResponse.accepted(
    res,
    {
      importId: bulkImport.id,
      fileName: req.file.originalname,
      status: BULK_IMPORT_STATUS.PROCESSING,
      totalRows: validationResult.totalRows,
      validRows: validationResult.validCount,
      errorRows: validationResult.errorCount,
      queuedInBackground,
    },
    'Bulk import job started successfully. Progress can be monitored via the job status API.'
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
