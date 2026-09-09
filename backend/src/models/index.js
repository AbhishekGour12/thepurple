import sequelize from '../config/database.js';
import User from './User.js';
import Category from './Category.js';
import Subcategory from './Subcategory.js';
import Product from './Product.js';
import ProductImage from './ProductImage.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Payment from './Payment.js';
import Shipment from './Shipment.js';
import Coupon from './Coupon.js';
import Banner from './Banner.js';
import Admin from './Admin.js';
import AdminSession from './AdminSession.js';
import AdminPasswordReset from './AdminPasswordReset.js';
import AuditLog from './AuditLog.js';
import BulkImport from './BulkImport.js';
import Color from './Color.js';
import Size from './Size.js';
import Attribute from './Attribute.js';
import AttributeValue from './AttributeValue.js';
import ProductAttributeValue from './ProductAttributeValue.js';
import ProductVariant from './ProductVariant.js';

// Setup Category & Subcategory associations
Category.hasMany(Subcategory, {
  foreignKey: 'categoryId',
  as: 'subcategories',
  onDelete: 'CASCADE',
});
Subcategory.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

// Setup Subcategory & Product associations
Subcategory.hasMany(Product, {
  foreignKey: 'subcategoryId',
  as: 'products',
  onDelete: 'CASCADE',
});
Product.belongsTo(Subcategory, {
  foreignKey: 'subcategoryId',
  as: 'subcategory',
});

// Setup Product & ProductImage associations
Product.hasMany(ProductImage, {
  foreignKey: 'productId',
  as: 'images',
  onDelete: 'CASCADE',
});
ProductImage.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Setup Product & ProductVariant associations
Product.hasMany(ProductVariant, {
  foreignKey: 'productId',
  as: 'variants',
  onDelete: 'CASCADE',
});
ProductVariant.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Variant Colors & Sizes
Color.hasMany(ProductVariant, {
  foreignKey: 'colorId',
  as: 'variants',
  onDelete: 'SET NULL',
});
ProductVariant.belongsTo(Color, {
  foreignKey: 'colorId',
  as: 'color',
});

Size.hasMany(ProductVariant, {
  foreignKey: 'sizeId',
  as: 'variants',
  onDelete: 'SET NULL',
});
ProductVariant.belongsTo(Size, {
  foreignKey: 'sizeId',
  as: 'size',
});

// Attribute & AttributeValue associations
Attribute.hasMany(AttributeValue, {
  foreignKey: 'attributeId',
  as: 'values',
  onDelete: 'CASCADE',
});
AttributeValue.belongsTo(Attribute, {
  foreignKey: 'attributeId',
  as: 'attribute',
});

// Product & AttributeValue Many-to-Many associations
Product.belongsToMany(AttributeValue, {
  through: ProductAttributeValue,
  foreignKey: 'productId',
  otherKey: 'attributeValueId',
  as: 'attributeValues',
});
AttributeValue.belongsToMany(Product, {
  through: ProductAttributeValue,
  foreignKey: 'attributeValueId',
  otherKey: 'productId',
  as: 'products',
});

// Admin Associations
Admin.hasMany(AdminSession, {
  foreignKey: 'adminId',
  as: 'sessions',
  onDelete: 'CASCADE',
});
AdminSession.belongsTo(Admin, {
  foreignKey: 'adminId',
  as: 'admin',
});

Admin.hasMany(AdminPasswordReset, {
  foreignKey: 'adminId',
  as: 'passwordResets',
  onDelete: 'CASCADE',
});
AdminPasswordReset.belongsTo(Admin, {
  foreignKey: 'adminId',
  as: 'admin',
});

Admin.hasMany(AuditLog, {
  foreignKey: 'adminId',
  as: 'auditLogs',
  onDelete: 'SET NULL',
});
AuditLog.belongsTo(Admin, {
  foreignKey: 'adminId',
  as: 'admin',
});

Admin.hasMany(BulkImport, {
  foreignKey: 'adminId',
  as: 'bulkImports',
  onDelete: 'CASCADE',
});
BulkImport.belongsTo(Admin, {
  foreignKey: 'adminId',
  as: 'admin',
});

// Setup User & Cart associations
User.hasOne(Cart, {
  foreignKey: 'userId',
  as: 'cart',
  onDelete: 'SET NULL',
});
Cart.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Setup Cart & CartItem associations
Cart.hasMany(CartItem, {
  foreignKey: 'cartId',
  as: 'items',
  onDelete: 'CASCADE',
});
CartItem.belongsTo(Cart, {
  foreignKey: 'cartId',
  as: 'cart',
});
CartItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Setup User & Order associations
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'SET NULL',
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Setup Order & OrderItem associations
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE',
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});
OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Setup Order & Payment associations
Order.hasOne(Payment, {
  foreignKey: 'orderId',
  as: 'payment',
  onDelete: 'CASCADE',
});
Payment.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

// Setup Order & Shipment associations
Order.hasOne(Shipment, {
  foreignKey: 'orderId',
  as: 'shipment',
  onDelete: 'CASCADE',
});
Shipment.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

export const models = {
  User,
  Category,
  Subcategory,
  Product,
  ProductImage,
  ProductVariant,
  Color,
  Size,
  Attribute,
  AttributeValue,
  ProductAttributeValue,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Coupon,
  Banner,
  Admin,
  AdminSession,
  AdminPasswordReset,
  AuditLog,
  BulkImport,
};

export {
  sequelize,
  User,
  Category,
  Subcategory,
  Product,
  ProductImage,
  ProductVariant,
  Color,
  Size,
  Attribute,
  AttributeValue,
  ProductAttributeValue,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Coupon,
  Banner,
  Admin,
  AdminSession,
  AdminPasswordReset,
  AuditLog,
  BulkImport,
};

export default models;
