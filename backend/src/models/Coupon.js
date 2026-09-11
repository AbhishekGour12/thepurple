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
      type: DataTypes.ENUM('PERCENTAGE', 'FLAT'),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
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
