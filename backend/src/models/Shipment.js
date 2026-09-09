import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Shipment = sequelize.define(
  'Shipment',
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
    courierName: {
      type: DataTypes.STRING(100),
      defaultValue: 'Shiprocket',
    },
    shiprocketShipmentId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shiprocketOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    awbCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'AWB_ASSIGNED',
        'PICKUP_SCHEDULED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'RTO_INITIATED',
        'RTO_DELIVERED',
        'CANCELLED'
      ),
      defaultValue: 'PENDING',
    },
    trackingUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    estimatedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastTrackingUpdate: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'shipments',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['awbCode'] },
      { fields: ['shiprocketShipmentId'] },
      { fields: ['status'] },
    ],
  }
);

export default Shipment;
