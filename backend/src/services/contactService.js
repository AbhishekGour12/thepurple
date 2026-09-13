import { Op } from 'sequelize';
import { ContactQuery, Admin, sequelize } from '../models/index.js';
import { mailService } from './mailService.js';
import AppError from '../utils/customError.js';
import logger from '../config/logger.js';

export const contactService = {
  /**
   * Submit a new contact query from the storefront
   */
  async submitContactQuery({ fullName, email, phone, subject, orderId, message }, meta = {}) {
    if (!fullName || !email || !subject || !message) {
      throw AppError.badRequest('Please fill in all required fields (Name, Email, Subject, Message).');
    }

    const newQuery = await ContactQuery.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      subject: subject.trim(),
      orderId: orderId ? orderId.trim() : null,
      message: message.trim(),
      status: 'PENDING',
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
    });

    // Optionally send acknowledgment email (asynchronously without blocking response)
    mailService.sendContactQueryReceivedEmail({
      toEmail: newQuery.email,
      recipientName: newQuery.fullName,
      subject: newQuery.subject,
      queryId: newQuery.id,
    }).catch((err) => {
      logger.warn(`Failed to send contact receipt acknowledgement: ${err.message}`);
    });

    return newQuery;
  },

  /**
   * List contact queries for admin panel with search, filters, pagination and KPIs
   */
  async listContactQueries({
    search = '',
    status = '',
    subject = '',
    startDate = '',
    endDate = '',
    page = 1,
    limit = 15,
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (status && ['PENDING', 'IN_PROGRESS', 'REPLIED', 'CLOSED'].includes(status)) {
      where.status = status;
    }

    if (subject) {
      where.subject = { [Op.iLike || Op.like]: `%${subject}%` };
    }

    if (search) {
      const isPostgres = sequelize.getDialect() === 'postgres';
      const likeOp = isPostgres ? Op.iLike : Op.like;
      where[Op.or] = [
        { fullName: { [likeOp]: `%${search}%` } },
        { email: { [likeOp]: `%${search}%` } },
        { phone: { [likeOp]: `%${search}%` } },
        { subject: { [likeOp]: `%${search}%` } },
        { orderId: { [likeOp]: `%${search}%` } },
        { message: { [likeOp]: `%${search}%` } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    const { count, rows } = await ContactQuery.findAndCountAll({
      where,
      include: [
        {
          model: Admin,
          as: 'repliedByAdmin',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    // KPI Counters
    const [total, pending, inProgress, replied, closed] = await Promise.all([
      ContactQuery.count(),
      ContactQuery.count({ where: { status: 'PENDING' } }),
      ContactQuery.count({ where: { status: 'IN_PROGRESS' } }),
      ContactQuery.count({ where: { status: 'REPLIED' } }),
      ContactQuery.count({ where: { status: 'CLOSED' } }),
    ]);

    return {
      queries: rows,
      summary: {
        total,
        pending,
        inProgress,
        replied,
        closed,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum) || 1,
      },
    };
  },

  /**
   * Get single query details
   */
  async getContactQueryById(id) {
    const query = await ContactQuery.findByPk(id, {
      include: [
        {
          model: Admin,
          as: 'repliedByAdmin',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
    });

    if (!query) {
      throw AppError.notFound('Contact inquiry not found.');
    }

    return query;
  },

  /**
   * Admin reply to contact query and send email
   */
  async replyToContactQuery(id, { replyMessage, adminNotes, status = 'REPLIED' }, adminUser) {
    if (!replyMessage || !replyMessage.trim()) {
      throw AppError.badRequest('Reply message cannot be empty.');
    }

    const query = await ContactQuery.findByPk(id);
    if (!query) {
      throw AppError.notFound('Contact inquiry not found.');
    }

    const updatedStatus = status || 'REPLIED';

    query.adminReply = replyMessage.trim();
    query.status = updatedStatus;
    query.repliedAt = new Date();
    query.repliedByAdminId = adminUser?.id || null;
    if (adminNotes !== undefined) {
      query.adminNotes = adminNotes ? adminNotes.trim() : null;
    }

    await query.save();

    // Send email to customer
    await mailService.sendContactQueryReplyEmail({
      toEmail: query.email,
      recipientName: query.fullName,
      subject: query.subject,
      originalMessage: query.message,
      replyMessage: query.adminReply,
      adminName: adminUser?.name || 'ThePurple Concierge Team',
      queryId: query.id,
    });

    const refreshed = await this.getContactQueryById(id);
    return refreshed;
  },

  /**
   * Update query status or internal notes without sending an email
   */
  async updateContactQueryStatus(id, { status, adminNotes }) {
    const query = await ContactQuery.findByPk(id);
    if (!query) {
      throw AppError.notFound('Contact inquiry not found.');
    }

    if (status) {
      if (!['PENDING', 'IN_PROGRESS', 'REPLIED', 'CLOSED'].includes(status)) {
        throw AppError.badRequest('Invalid status provided.');
      }
      query.status = status;
    }

    if (adminNotes !== undefined) {
      query.adminNotes = adminNotes ? adminNotes.trim() : null;
    }

    await query.save();
    return this.getContactQueryById(id);
  },

  /**
   * Delete a contact query
   */
  async deleteContactQuery(id) {
    const query = await ContactQuery.findByPk(id);
    if (!query) {
      throw AppError.notFound('Contact inquiry not found.');
    }

    await query.destroy();
    return { success: true, message: 'Inquiry deleted successfully.' };
  },
};

export default contactService;
