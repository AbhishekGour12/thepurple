import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    paymentGateway: {
      type: DataTypes.ENUM('RAZORPAY', 'COD'),
      allowNull: false,
    },
    gatewayOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gatewayPaymentId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gatewaySignature: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'),
      defaultValue: 'PENDING',
    },
    gatewayResponse: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'payments',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['gatewayOrderId'] },
      { fields: ['gatewayPaymentId'] },
      { fields: ['status'] },
    ],
  }
);

export default Payment;
