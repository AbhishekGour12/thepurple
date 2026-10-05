import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Coupon = sequelize.define(
  'Coupon',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    discountType: {
      type: DataTypes.STRING(30), // 'PERCENTAGE' | 'FLAT' | 'FREE_SHIPPING'
      allowNull: false,
      defaultValue: 'PERCENTAGE',
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    isAutoApply: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'coupons',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['isActive'] },
      { fields: ['startDate', 'endDate'] },
    ],
  }
);

export default Coupon;
