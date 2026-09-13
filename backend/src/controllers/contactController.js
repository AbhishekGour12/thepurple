import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import contactService from '../services/contactService.js';

export const submitContact = asyncHandler(async (req, res) => {
  const { fullName, email, phone, subject, orderId, message } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const inquiry = await contactService.submitContactQuery(
    { fullName, email, phone, subject, orderId, message },
    { ipAddress, userAgent }
  );

  return ApiResponse.created(
    res,
    { inquiry: { id: inquiry.id, fullName: inquiry.fullName, email: inquiry.email, createdAt: inquiry.createdAt } },
    'Thank you! Your message has been received. Our concierge support will reach out to you shortly.'
  );
});

export default {
  submitContact,
};
