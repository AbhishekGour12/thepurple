import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const REVIEW_STATUS = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
};

export const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    userName: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { notEmpty: true },
    },
    userEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    isVerifiedPurchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM(
        REVIEW_STATUS.APPROVED,
        REVIEW_STATUS.PENDING,
        REVIEW_STATUS.REJECTED
      ),
      allowNull: false,
      defaultValue: REVIEW_STATUS.APPROVED,
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      { fields: ['productId'] },
      { fields: ['userId'] },
      { fields: ['rating'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Review;
