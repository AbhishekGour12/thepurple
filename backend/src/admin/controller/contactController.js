import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import contactService from '../../services/contactService.js';

export const listQueries = asyncHandler(async (req, res) => {
  const { search, status, subject, startDate, endDate, page, limit } = req.query;
  const result = await contactService.listContactQueries({
    search,
    status,
    subject,
    startDate,
    endDate,
    page,
    limit,
  });

  return ApiResponse.success(res, result, 'Contact queries retrieved successfully');
});

export const getQuery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = await contactService.getContactQueryById(id);
  return ApiResponse.success(res, { query }, 'Contact query details retrieved successfully');
});

export const replyToQuery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replyMessage, adminNotes, status } = req.body;
  const updated = await contactService.replyToContactQuery(
    id,
    { replyMessage, adminNotes, status },
    req.admin
  );

  return ApiResponse.success(res, { query: updated }, 'Reply sent successfully and emailed to customer');
});

export const updateQueryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const updated = await contactService.updateContactQueryStatus(id, { status, adminNotes });

  return ApiResponse.success(res, { query: updated }, 'Inquiry status updated successfully');
});

export const deleteQuery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await contactService.deleteContactQuery(id);
  return ApiResponse.success(res, result, 'Inquiry deleted successfully');
});

export default {
  listQueries,
  getQuery,
  replyToQuery,
  updateQueryStatus,
  deleteQuery,
};
