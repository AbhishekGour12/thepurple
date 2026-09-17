import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import paymentService from '../services/paymentService.js';

export const listPayments = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    gateway,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy,
    sortOrder,
  } = req.query;

  const result = await paymentService.listPayments({
    page,
    limit,
    search,
    gateway,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy,
    sortOrder,
  });

  return ApiResponse.success(res, result, 'Payments retrieved successfully');
});

export const getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await paymentService.getPaymentStats();
  return ApiResponse.success(res, stats, 'Payment statistics retrieved successfully');
});

export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await paymentService.getPaymentDetails(id);

  if (!payment) {
    return ApiResponse.error(res, 'Payment transaction not found', 404);
  }

  return ApiResponse.success(res, { payment }, 'Payment details retrieved successfully');
});

export const exportPayments = asyncHandler(async (req, res) => {
  const {
    search,
    gateway,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    format = 'json',
  } = req.query;

  const data = await paymentService.exportPayments({
    search,
    gateway,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  });

  if (format === 'csv') {
    if (!data.length) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="payments-export.csv"');
      return res.status(200).send('Transaction ID,Order Number,Gateway Payment ID,Customer Name,Phone,Email,Gateway,Amount,Status,Date\n');
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName] !== undefined && row[fieldName] !== null ? String(row[fieldName]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payments-export-${Date.now()}.csv"`);
    return res.status(200).send(csvRows.join('\n'));
  }

  return ApiResponse.success(res, { payments: data, total: data.length }, 'Payments exported successfully');
});

export default {
  listPayments,
  getPaymentStats,
  getPaymentDetails,
  exportPayments,
};
