import { Op } from 'sequelize';
import { User, Order } from '../../models/index.js';
import AppError from '../../utils/customError.js';

export const listUsers = async ({ search = '', role, status, authProvider, page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    const s = `%${search.trim()}%`;
    where[Op.or] = [
      { name: { [Op.iLike]: s } },
      { email: { [Op.iLike]: s } },
      { mobile: { [Op.iLike]: s } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  if (authProvider) {
    where.authProvider = authProvider;
  }

  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const { count, rows: users } = await User.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parsedLimit,
    offset,
    include: [
      {
        model: Order,
        as: 'orders',
        attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'paymentStatus', 'createdAt'],
        required: false,
      },
    ],
  });

  // Calculate user metrics
  const mappedUsers = users.map((u) => {
    const orders = u.orders || [];
    const totalSpent = orders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

    return {
      id: u.id,
      name: u.name || 'Unnamed Customer',
      email: u.email,
      mobile: u.mobile,
      avatar: u.avatar,
      role: u.role,
      status: u.status,
      authProvider: u.authProvider,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      ordersCount: orders.length,
      totalSpent,
      recentOrders: orders.slice(0, 3),
    };
  });

  // Summary counts
  const [totalCount, activeCount, googleCount, blockedCount] = await Promise.all([
    User.count(),
    User.count({ where: { status: 'ACTIVE' } }),
    User.count({ where: { authProvider: 'GOOGLE' } }),
    User.count({ where: { status: 'BLOCKED' } }),
  ]);

  return {
    users: mappedUsers,
    summary: {
      total: totalCount,
      active: activeCount,
      googleAuth: googleCount,
      blocked: blockedCount,
    },
    pagination: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  };
};

export const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    include: [
      {
        model: Order,
        as: 'orders',
        order: [['createdAt', 'DESC']],
      },
    ],
  });

  if (!user) {
    throw AppError.notFound(`User not found with ID: ${id}`);
  }

  const orders = user.orders || [];
  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

  return {
    ...user.toJSON(),
    ordersCount: orders.length,
    totalSpent,
  };
};

export const updateUserStatus = async (id, status) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw AppError.notFound(`User not found with ID: ${id}`);
  }

  const validStatuses = ['ACTIVE', 'INACTIVE', 'BLOCKED'];
  if (!validStatuses.includes(status)) {
    throw AppError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  user.status = status;
  await user.save();
  return user;
};

export default {
  listUsers,
  getUserById,
  updateUserStatus,
};
