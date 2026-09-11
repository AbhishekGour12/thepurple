import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Cart = sequelize.define(
  'Cart',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Null for guest cart sessions
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ORDERED', 'ABANDONED'),
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'carts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['sessionId'] },
      { fields: ['status'] },
    ],
  }
);

export default Cart;
