import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const CONTACT_QUERY_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  REPLIED: 'REPLIED',
  CLOSED: 'CLOSED',
};

export const ContactQuery = sequelize.define(
  'ContactQuery',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Full name is required' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: { msg: 'Must be a valid email address' },
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Subject is required' },
      },
    },
    orderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Message is required' },
      },
    },
    status: {
      type: DataTypes.ENUM(
        CONTACT_QUERY_STATUS.PENDING,
        CONTACT_QUERY_STATUS.IN_PROGRESS,
        CONTACT_QUERY_STATUS.REPLIED,
        CONTACT_QUERY_STATUS.CLOSED
      ),
      allowNull: false,
      defaultValue: CONTACT_QUERY_STATUS.PENDING,
    },
    adminReply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    repliedByAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    ipAddress: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: 'contact_queries',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['status'] },
      { fields: ['subject'] },
      { fields: ['createdAt'] },
      { fields: ['repliedByAdminId'] },
    ],
  }
);

export default ContactQuery;
