import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    status: {
      type: DataTypes.ENUM(
        'ORDER_CREATED',
        'PAYMENT_RECEIVED',
        'PACKING',
        'SHIPROCKET_PICKUP',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED',
        'RETURNED'
      ),
      defaultValue: 'ORDER_CREATED',
      allowNull: false,
    },
    // Shipping Address Details (FRD Section 3 / Checkout)
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customerMobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    shippingAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    // Amounts
    subtotalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('RAZORPAY', 'COD'),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
      defaultValue: 'PENDING',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    indexes: [
      { fields: ['orderNumber'], unique: true },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['paymentStatus'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Order;
