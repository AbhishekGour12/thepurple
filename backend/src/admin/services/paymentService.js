import { Op } from 'sequelize';
import { Payment, Order, User, OrderItem, Product, sequelize } from '../../models/index.js';

export const paymentService = {
  /**
   * 1. List Payments with Filters, Search, and Pagination
   */
  async listPayments({
    page = 1,
    limit = 20,
    search = '',
    gateway,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  }) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const paymentWhere = {};
    const orderWhere = {};

    // Filter by Gateway (RAZORPAY, COD, etc.)
    if (gateway && gateway !== 'ALL') {
      paymentWhere.paymentGateway = gateway.toUpperCase();
    }

    // Filter by Status (SUCCESS, PENDING, FAILED, REFUNDED)
    if (status && status !== 'ALL') {
      paymentWhere.status = status.toUpperCase();
    }

    // Filter by Amount Range
    if (minAmount || maxAmount) {
      paymentWhere.amount = {};
      if (minAmount) paymentWhere.amount[Op.gte] = parseFloat(minAmount);
      if (maxAmount) paymentWhere.amount[Op.lte] = parseFloat(maxAmount);
    }

    // Filter by Date Range
    if (startDate || endDate) {
      paymentWhere.createdAt = {};
      if (startDate) {
        paymentWhere.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        paymentWhere.createdAt[Op.lte] = end;
      }
    }

    // Search by Gateway Payment ID, Order ID, Customer Details
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      paymentWhere[Op.or] = [
        { gatewayPaymentId: { [Op.iLike]: q } },
        { gatewayOrderId: { [Op.iLike]: q } },
        { '$order.orderNumber$': { [Op.iLike]: q } },
        { '$order.customerName$': { [Op.iLike]: q } },
        { '$order.customerMobile$': { [Op.iLike]: q } },
        { '$order.customerEmail$': { [Op.iLike]: q } },
      ];
    }

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: paymentWhere,
      include: [
        {
          model: Order,
          as: 'order',
          where: orderWhere,
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'mobile', 'avatar'],
              required: false,
            },
            {
              model: OrderItem,
              as: 'items',
              attributes: ['id', 'productName', 'quantity', 'price', 'totalPrice'],
              required: false,
            },
          ],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit, 10),
      offset,
      distinct: true,
    });

    return {
      payments,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      },
    };
  },

  /**
   * 2. Get Aggregated Payment Metrics / Statistics
   */
  async getPaymentStats() {
    const [
      totalCount,
      successPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      razorpayPayments,
      codPayments,
    ] = await Promise.all([
      Payment.count(),
      Payment.findAll({
        where: { status: 'SUCCESS' },
        attributes: ['amount'],
      }),
      Payment.findAll({
        where: { status: 'PENDING' },
        attributes: ['amount'],
      }),
      Payment.findAll({
        where: { status: 'FAILED' },
        attributes: ['amount'],
      }),
      Payment.findAll({
        where: { status: 'REFUNDED' },
        attributes: ['amount'],
      }),
      Payment.findAll({
        where: { paymentGateway: 'RAZORPAY', status: 'SUCCESS' },
        attributes: ['amount'],
      }),
      Payment.findAll({
        where: { paymentGateway: 'COD' },
        attributes: ['amount'],
      }),
    ]);

    const totalCollected = successPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const failedAmount = failedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const refundedAmount = refundedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const razorpayVolume = razorpayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const codVolume = codPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    return {
      totalTransactions: totalCount,
      totalCollected,
      successCount: successPayments.length,
      pendingCount: pendingPayments.length,
      pendingAmount,
      failedCount: failedPayments.length,
      failedAmount,
      refundedCount: refundedPayments.length,
      refundedAmount,
      razorpayVolume,
      razorpayCount: razorpayPayments.length,
      codVolume,
      codCount: codPayments.length,
    };
  },

  /**
   * 3. Get Single Payment Details
   */
  async getPaymentDetails(id) {
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'mobile', 'avatar'],
            },
            {
              model: OrderItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'slug', 'price'],
                },
              ],
            },
          ],
        },
      ],
    });

    return payment;
  },

  /**
   * 4. Export Payments Dataset
   */
  async exportPayments(filters = {}) {
    const { payments } = await this.listPayments({
      ...filters,
      page: 1,
      limit: 10000, // Export all matching records up to 10k
    });

    return payments.map((p) => ({
      transactionId: p.id,
      gatewayPaymentId: p.gatewayPaymentId || 'N/A',
      gatewayOrderId: p.gatewayOrderId || 'N/A',
      orderNumber: p.order?.orderNumber || 'N/A',
      customerName: p.order?.customerName || p.order?.user?.name || 'Customer',
      customerMobile: p.order?.customerMobile || p.order?.user?.mobile || 'N/A',
      customerEmail: p.order?.customerEmail || p.order?.user?.email || 'N/A',
      gateway: p.paymentGateway,
      amount: parseFloat(p.amount || 0),
      currency: p.currency || 'INR',
      status: p.status,
      orderStatus: p.order?.status || 'N/A',
      createdAt: p.createdAt,
      city: p.order?.city || 'N/A',
      state: p.order?.state || 'N/A',
      pincode: p.order?.pincode || 'N/A',
    }));
  },
};

export default paymentService;
