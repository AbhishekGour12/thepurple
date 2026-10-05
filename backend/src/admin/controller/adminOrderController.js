import { Order, OrderItem, Payment, Shipment, Product, ProductImage, User, sequelize } from '../../models/index.js';
import shiprocketService from '../../services/shiprocketService.js';
import shiprocketCronService from '../../services/shiprocketCronService.js';
import mailService from '../../services/mailService.js';
import ApiResponse from '../../utils/apiResponse.js';

const isUuid = (val) => Boolean(val && typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim()));

const getOrderWhereClause = (id) => {
  if (!id) return { id: null };
  const strId = String(id).trim();
  return isUuid(strId)
    ? { [sequelize.Sequelize.Op.or]: [{ id: strId }, { orderNumber: strId }] }
    : { orderNumber: strId };
};

export const adminOrderController = {
  /**
   * 1. Get List of Orders with Filters & Search
   */
  async getOrders(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        status,
        paymentStatus,
        refundStatus,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = req.query;

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const whereClause = {};

      if (status && status !== 'ALL') {
        whereClause.status = status;
      }

      if (paymentStatus && paymentStatus !== 'ALL') {
        whereClause.paymentStatus = paymentStatus;
      }

      if (refundStatus && refundStatus !== 'ALL') {
        whereClause.refundStatus = refundStatus;
      }

      if (search && search.trim()) {
        const query = `%${search.trim()}%`;
        whereClause[sequelize.Sequelize.Op.or] = [
          { orderNumber: { [sequelize.Sequelize.Op.iLike]: query } },
          { customerName: { [sequelize.Sequelize.Op.iLike]: query } },
          { customerMobile: { [sequelize.Sequelize.Op.iLike]: query } },
          { customerEmail: { [sequelize.Sequelize.Op.iLike]: query } },
          { city: { [sequelize.Sequelize.Op.iLike]: query } },
          { pincode: { [sequelize.Sequelize.Op.iLike]: query } },
        ];
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'slug', 'price', 'salePrice'],
                include: [{ model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] }],
              },
            ],
          },
          { model: Payment, as: 'payment', attributes: ['id', 'status', 'gatewayPaymentId', 'paymentGateway'] },
          { model: Shipment, as: 'shipment' },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit, 10),
        offset,
        distinct: true,
      });

      return ApiResponse.success(
        res,
        {
          orders,
          pagination: {
            total: count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(count / parseInt(limit, 10)),
          },
        },
        'Orders list retrieved'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 2. Get Single Order Details
   */
  async getOrderDetails(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'slug', 'price', 'salePrice'],
                include: [{ model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] }],
              },
            ],
          },
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'mobile'] },
          { model: Payment, as: 'payment' },
          { model: Shipment, as: 'shipment' },
        ],
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      // Live Shiprocket status if AWB available
      let liveTracking = null;
      if (order.awbCode) {
        liveTracking = await shiprocketService.trackShipment(order.awbCode);
      }

      return ApiResponse.success(
        res,
        {
          ...order.toJSON(),
          liveTracking,
        },
        'Order details retrieved'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 3. Update Order Status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = [
        'ORDER_CREATED',
        'PAYMENT_RECEIVED',
        'PACKING',
        'SHIPROCKET_PICKUP',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ];

      if (!validStatuses.includes(status)) {
        return ApiResponse.error(res, `Invalid status value. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
        include: [
          { model: Shipment, as: 'shipment' },
          { model: OrderItem, as: 'items' },
        ],
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      const wasAlreadyCancelled = order.status === 'CANCELLED';
      const updates = { status };
      if (notes) updates.notes = notes;

      let shiprocketCancelResult = null;

      if (status === 'CANCELLED') {
        if (!order.cancelledAt) {
          updates.cancelledAt = new Date();
        }
        if (notes) {
          updates.cancellationReason = notes;
        }

        const isPrepaid = order.paymentMethod === 'RAZORPAY' && order.paymentStatus === 'PAID';
        if (isPrepaid && (!order.refundStatus || order.refundStatus === 'NONE')) {
          updates.refundStatus = 'REQUESTED';
          updates.refundAmount = order.totalAmount;
          updates.refundReason = notes ? `Admin cancelled: ${notes}` : 'Order cancelled by admin';
        }

        // 1. Update Shipment record if present
        if (order.shipment) {
          await order.shipment.update({ status: 'CANCELLED' });
        }

        // 2. Trigger Shiprocket cancellation automatically
        try {
          shiprocketCancelResult = await shiprocketService.cancelOrder({
            shiprocketOrderId: order.shiprocketOrderId,
            awbCode: order.awbCode,
            shipmentId: order.shiprocketShipmentId || order.shipment?.shiprocketShipmentId,
            orderNumber: order.orderNumber,
          });
          console.log(`[Admin Update] Shiprocket cancellation result for #${order.orderNumber}:`, shiprocketCancelResult);
        } catch (srErr) {
          console.warn(`[Admin Update] Shiprocket cancellation failed for #${order.orderNumber}:`, srErr.message);
          shiprocketCancelResult = { success: false, message: srErr.message };
        }

        // 3. Restock inventory if not already cancelled before
        if (!wasAlreadyCancelled && order.items && order.items.length > 0) {
          for (const item of order.items) {
            if (item.productId && item.quantity > 0) {
              try {
                await Product.increment('stockQuantity', {
                  by: item.quantity,
                  where: { id: item.productId },
                });
              } catch (stockErr) {
                console.warn(`Failed to restock product ${item.productId}:`, stockErr.message);
              }
            }
          }
        }
      }

      await order.update(updates);

      if (status === 'CANCELLED' && order.customerEmail) {
        mailService
          .sendOrderCancellationEmail({
            order,
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            reason: notes || 'Cancelled by admin',
          })
          .catch((mErr) => console.warn(`[Mail] Admin cancellation email failed for #${order.orderNumber}:`, mErr.message));
      }

      return ApiResponse.success(
        res,
        {
          ...order.toJSON(),
          shiprocketCancellation: shiprocketCancelResult,
        },
        `Order status updated to ${status}${
          status === 'CANCELLED' && shiprocketCancelResult?.success ? ' & cancelled on Shiprocket' : ''
        }`
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 3b. Dedicated Cancel Order (Admin)
   */
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason = 'Cancelled by administrator' } = req.body;

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
        include: [
          { model: Shipment, as: 'shipment' },
          { model: OrderItem, as: 'items' },
        ],
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      if (order.status === 'CANCELLED') {
        return ApiResponse.error(res, 'This order is already cancelled', 400);
      }

      const isPrepaid = order.paymentMethod === 'RAZORPAY' && order.paymentStatus === 'PAID';

      // 1. Update Order Status to CANCELLED
      await order.update({
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
        refundStatus: isPrepaid ? (order.refundStatus === 'PROCESSED' ? 'PROCESSED' : 'REQUESTED') : 'NONE',
        refundReason: isPrepaid ? `Admin cancelled: ${reason}` : null,
        refundAmount: isPrepaid ? order.totalAmount : 0,
      });

      // 2. Update Shipment Record
      if (order.shipment) {
        await order.shipment.update({ status: 'CANCELLED' });
      }

      // 3. Cancel on Shiprocket
      let shiprocketCancelResult = null;
      try {
        shiprocketCancelResult = await shiprocketService.cancelOrder({
          shiprocketOrderId: order.shiprocketOrderId,
          awbCode: order.awbCode,
          shipmentId: order.shiprocketShipmentId || order.shipment?.shiprocketShipmentId,
          orderNumber: order.orderNumber,
        });
        console.log(`[Admin Cancel Order] Shiprocket cancellation result for #${order.orderNumber}:`, shiprocketCancelResult);
      } catch (srErr) {
        console.warn(`[Admin Cancel Order] Shiprocket cancellation notice for #${order.orderNumber}:`, srErr.message);
        shiprocketCancelResult = { success: false, message: srErr.message };
      }

      // 4. Restock inventory
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.productId && item.quantity > 0) {
            try {
              await Product.increment('stockQuantity', {
                by: item.quantity,
                where: { id: item.productId },
              });
            } catch (stockErr) {
              console.warn(`Failed to restock product ${item.productId}:`, stockErr.message);
            }
          }
        }
      }

      // Send Order Cancellation Email via ZeptoMail
      if (order.customerEmail) {
        mailService
          .sendOrderCancellationEmail({
            order,
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            reason,
          })
          .catch((mErr) => console.warn(`[Mail] Admin cancel email failed for #${order.orderNumber}:`, mErr.message));
      }

      return ApiResponse.success(
        res,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'CANCELLED',
          refundStatus: order.refundStatus,
          refundAmount: order.refundAmount,
          shiprocketCancellation: shiprocketCancelResult,
        },
        `Order #${order.orderNumber} has been cancelled successfully${
          shiprocketCancelResult?.success ? ' and cancelled in Shiprocket' : ''
        }`
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4. Assign Courier & Generate Real Shiprocket Shipping Label / AWB
   */
  async generateShiprocketLabel(req, res, next) {
    try {
      const { id } = req.params;
      const { courierCompanyId } = req.body || {};

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
        include: [{ model: OrderItem, as: 'items' }],
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      // 1. If not yet pushed to Shiprocket, push now
      if (!order.shiprocketOrderId || !order.shiprocketShipmentId) {
        const createRes = await shiprocketService.createOrder(order, order.items);
        if (createRes.success && createRes.shiprocketOrderId) {
          await order.update({
            shiprocketOrderId: createRes.shiprocketOrderId,
            shiprocketShipmentId: createRes.shiprocketShipmentId,
            awbCode: createRes.awbCode || order.awbCode,
            courierName: createRes.courierName || order.courierName,
          });
        } else {
          return ApiResponse.error(
            res,
            `Shiprocket order creation failed: ${createRes.message || 'Could not push order to Shiprocket'}`,
            400
          );
        }
      }

      const shipmentId = order.shiprocketShipmentId;
      if (!shipmentId) {
        return ApiResponse.error(res, 'Shiprocket Shipment ID not found for this order', 400);
      }

      // 2. Assign Real Courier & AWB if not yet assigned
      let awbCode = order.awbCode;
      let courierName = order.courierName;

      if (!awbCode) {
        const awbResult = await shiprocketService.assignAwb(shipmentId, courierCompanyId);
        if (!awbResult.success || !awbResult.awbCode) {
          return ApiResponse.error(
            res,
            `Shiprocket Courier Assign Failed: ${awbResult.message || 'Please check Shiprocket wallet balance (min ₹100)'}`,
            400
          );
        }
        awbCode = awbResult.awbCode;
        courierName = awbResult.courierName;

        await order.update({
          awbCode,
          courierName,
        });
      }

      // 3. Generate Official Shipping Label PDF from Shiprocket (for parcel box paste)
      const labelResult = await shiprocketService.generateLabel(shipmentId);
      const labelUrl = labelResult.success ? labelResult.labelUrl : order.labelUrl;

      // 4. Generate Official Tax Invoice PDF from Shiprocket
      let invoiceUrl = order.invoiceUrl;
      try {
        const invResult = await shiprocketService.generateInvoice(order.shiprocketOrderId);
        if (invResult.success && invResult.invoiceUrl) {
          invoiceUrl = invResult.invoiceUrl;
        }
      } catch (invErr) {
        console.warn('[AdminOrder] Invoice generation warning:', invErr.message);
      }

      // 5. Automatically Schedule Next Day Courier Pickup in Shiprocket
      let pickupScheduledDate = order.pickupScheduledDate;
      try {
        const pickupResult = await shiprocketService.schedulePickup(shipmentId);
        if (pickupResult.success && pickupResult.pickupScheduledDate) {
          pickupScheduledDate = pickupResult.pickupScheduledDate;
        }
      } catch (pickErr) {
        console.warn('[AdminOrder] Pickup scheduling warning:', pickErr.message);
      }

      // 6. Update Order with all dispatch metadata
      await order.update({
        isLabelGenerated: true,
        awbCode,
        courierName,
        labelUrl: labelUrl || order.labelUrl,
        invoiceUrl: invoiceUrl || order.invoiceUrl,
        pickupScheduledDate: pickupScheduledDate || order.pickupScheduledDate,
        status: 'SHIPROCKET_PICKUP',
      });

      return ApiResponse.success(
        res,
        {
          isLabelGenerated: true,
          awbCode,
          courierName,
          labelUrl,
          invoiceUrl,
          pickupScheduledDate,
          shipmentId,
          shiprocketOrderId: order.shiprocketOrderId,
          status: 'SHIPROCKET_PICKUP',
        },
        `Courier ${courierName} assigned (AWB: ${awbCode}). Shipping Label, Tax Invoice, and Next Day Pickup scheduled successfully!`
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4b. Schedule Courier Pickup in Shiprocket
   */
  async scheduleShiprocketPickup(req, res, next) {
    try {
      const { id } = req.params;
      const { pickupDate } = req.body || {};

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      if (!order.shiprocketShipmentId) {
        return ApiResponse.error(res, 'Order is not yet created in Shiprocket. Generate Shipping Label first.', 400);
      }

      if (!order.awbCode) {
        return ApiResponse.error(res, 'AWB is not yet assigned. Please click "Assign Courier & Generate Label" first.', 400);
      }

      const pickupResult = await shiprocketService.schedulePickup(order.shiprocketShipmentId, pickupDate);

      if (!pickupResult.success) {
        return ApiResponse.error(
          res,
          `Shiprocket Pickup Scheduling Failed: ${pickupResult.message || 'Could not schedule pickup'}`,
          400
        );
      }

      await order.update({
        status: 'SHIPROCKET_PICKUP',
        pickupScheduledDate: pickupResult.pickupScheduledDate,
      });

      return ApiResponse.success(
        res,
        {
          status: 'SHIPROCKET_PICKUP',
          pickupScheduledDate: pickupResult.pickupScheduledDate,
          pickupTokenNumber: pickupResult.pickupTokenNumber,
        },
        `Courier Pickup scheduled successfully for ${pickupResult.pickupScheduledDate}`
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4c. Generate Official Tax Invoice PDF from Shiprocket
   */
  async generateShiprocketInvoice(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      if (!order.shiprocketOrderId) {
        return ApiResponse.error(res, 'Shiprocket Order ID not found for this order', 400);
      }

      const invoiceResult = await shiprocketService.generateInvoice(order.shiprocketOrderId);

      if (!invoiceResult.success || !invoiceResult.invoiceUrl) {
        return ApiResponse.error(
          res,
          `Shiprocket Invoice Generation Failed: ${invoiceResult.message || 'Could not generate invoice PDF'}`,
          400
        );
      }

      await order.update({
        invoiceUrl: invoiceResult.invoiceUrl,
      });

      return ApiResponse.success(
        res,
        {
          invoiceUrl: invoiceResult.invoiceUrl,
        },
        'Shiprocket Tax Invoice PDF generated successfully'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4d. Generate Manifest PDF from Shiprocket
   */
  async generateShiprocketManifest(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      if (!order.shiprocketShipmentId) {
        return ApiResponse.error(res, 'Shiprocket Shipment ID not found', 400);
      }

      const manifestResult = await shiprocketService.generateManifest(order.shiprocketShipmentId);

      if (!manifestResult.success || !manifestResult.manifestUrl) {
        return ApiResponse.error(
          res,
          `Shiprocket Manifest Generation Failed: ${manifestResult.message || 'Could not generate manifest'}`,
          400
        );
      }

      await order.update({
        manifestUrl: manifestResult.manifestUrl,
      });

      return ApiResponse.success(
        res,
        {
          manifestUrl: manifestResult.manifestUrl,
        },
        'Shiprocket Manifest PDF generated successfully'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4b. Sync Live Tracking Status directly from Shiprocket
   */
  async syncShiprocketStatus(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
        include: [{ model: Shipment, as: 'shipment' }],
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      if (!order.awbCode) {
        return ApiResponse.error(res, 'No AWB assigned to this order yet. Please generate label first.', 400);
      }

      const syncResult = await shiprocketService.syncOrderTracking(order);

      if (syncResult.success) {
        return ApiResponse.success(
          res,
          {
            orderId: order.id,
            status: syncResult.mappedStatus || order.status,
            awbCode: order.awbCode,
            trackingUrl: order.trackingUrl,
            liveTracking: syncResult.liveTracking,
          },
          `Shiprocket live status synced: "${syncResult.mappedStatus || order.status}"`
        );
      }

      return ApiResponse.success(
        res,
        {
          orderId: order.id,
          status: order.status,
          awbCode: order.awbCode,
          liveTracking: syncResult.liveTracking,
        },
        syncResult.message || 'Shiprocket status polled (no new milestones yet)'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4c. Batch Sync All Active Orders with Shiprocket (Admin on-demand)
   */
  async syncAllActiveShipments(req, res, next) {
    try {
      const result = await shiprocketCronService.syncAllActiveShipments();
      return ApiResponse.success(
        res,
        result,
        `Shiprocket batch sync completed: ${result.synced || 0}/${result.totalFound || 0} orders synced (${result.statusChanged || 0} statuses updated)`
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 5. Process Refund Request for Cancelled Order
   */
  async processRefund(req, res, next) {
    try {
      const { id } = req.params;
      const { refundStatus = 'PROCESSED', refundAmount, notes } = req.body;

      const order = await Order.findOne({ where: getOrderWhereClause(id) });
      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      const updates = {
        refundStatus,
        refundProcessedAt: refundStatus === 'PROCESSED' ? new Date() : null,
      };

      if (refundAmount) {
        updates.refundAmount = parseFloat(refundAmount);
      }

      if (notes) {
        updates.notes = `${order.notes || ''}\n[Admin Refund Note]: ${notes}`.trim();
      }

      await order.update(updates);

      return ApiResponse.success(
        res,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          refundStatus: order.refundStatus,
          refundAmount: order.refundAmount,
          refundProcessedAt: order.refundProcessedAt,
        },
        `Refund request has been updated to "${refundStatus}"`
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 6. Get Order Stats Summary for Dashboard
   */
  async getOrderStats(req, res, next) {
    try {
      const totalOrders = await Order.count();
      const pendingPayment = await Order.count({ where: { status: 'ORDER_CREATED' } });
      const packingOrders = await Order.count({ where: { status: 'PACKING' } });
      const pickupOrders = await Order.count({ where: { status: 'SHIPROCKET_PICKUP' } });
      const inTransitOrders = await Order.count({ where: { status: 'IN_TRANSIT' } });
      const deliveredOrders = await Order.count({ where: { status: 'DELIVERED' } });
      const cancelledOrders = await Order.count({ where: { status: 'CANCELLED' } });
      const refundRequests = await Order.count({ where: { refundStatus: 'REQUESTED' } });

      const totalRevenue = await Order.sum('totalAmount', {
        where: { paymentStatus: 'PAID' },
      });

      return ApiResponse.success(
        res,
        {
          totalOrders,
          pendingPayment,
          packingOrders,
          pickupOrders,
          inTransitOrders,
          deliveredOrders,
          cancelledOrders,
          refundRequests,
          totalRevenue: totalRevenue || 0,
        },
        'Order stats retrieved'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 7. Export Orders Dataset (Excel/CSV support)
   */
  async exportOrders(req, res, next) {
    try {
      const {
        search = '',
        status,
        paymentStatus,
        refundStatus,
        startDate,
        endDate,
        format = 'json',
      } = req.query;

      const whereClause = {};

      if (status && status !== 'ALL') {
        whereClause.status = status;
      }

      if (paymentStatus && paymentStatus !== 'ALL') {
        whereClause.paymentStatus = paymentStatus;
      }

      if (refundStatus && refundStatus !== 'ALL') {
        whereClause.refundStatus = refundStatus;
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt[sequelize.Sequelize.Op.gte] = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          whereClause.createdAt[sequelize.Sequelize.Op.lte] = end;
        }
      }

      if (search && search.trim()) {
        const query = `%${search.trim()}%`;
        whereClause[sequelize.Sequelize.Op.or] = [
          { orderNumber: { [sequelize.Sequelize.Op.iLike]: query } },
          { customerName: { [sequelize.Sequelize.Op.iLike]: query } },
          { customerMobile: { [sequelize.Sequelize.Op.iLike]: query } },
          { customerEmail: { [sequelize.Sequelize.Op.iLike]: query } },
          { city: { [sequelize.Sequelize.Op.iLike]: query } },
          { pincode: { [sequelize.Sequelize.Op.iLike]: query } },
        ];
      }

      const orders = await Order.findAll({
        where: whereClause,
        include: [
          {
            model: OrderItem,
            as: 'items',
            attributes: ['id', 'productName', 'quantity', 'price', 'totalPrice'],
          },
          { model: Payment, as: 'payment', attributes: ['id', 'status', 'gatewayPaymentId', 'paymentGateway'] },
          { model: Shipment, as: 'shipment' },
        ],
        order: [['createdAt', 'DESC']],
        limit: 10000,
      });

      const exportData = orders.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerMobile: o.customerMobile,
        customerEmail: o.customerEmail || 'N/A',
        status: o.status,
        totalAmount: parseFloat(o.totalAmount || 0),
        subtotalAmount: parseFloat(o.subtotalAmount || 0),
        discountAmount: parseFloat(o.discountAmount || 0),
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        gatewayPaymentId: o.payment?.gatewayPaymentId || 'N/A',
        city: o.city,
        state: o.state,
        pincode: o.pincode,
        awbCode: o.awbCode || 'N/A',
        courierName: o.courierName || 'N/A',
        itemCount: o.items ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0,
        createdAt: o.createdAt,
      }));

      if (format === 'csv') {
        if (!exportData.length) {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="orders-export.csv"');
          return res.status(200).send('Order Number,Customer Name,Phone,Email,Status,Amount,Payment Method,Payment Status,City,State,Pincode,AWB,Date\n');
        }

        const headers = Object.keys(exportData[0]);
        const csvRows = [
          headers.join(','),
          ...exportData.map((row) =>
            headers
              .map((fieldName) => {
                const val = row[fieldName] !== undefined && row[fieldName] !== null ? String(row[fieldName]) : '';
                return `"${val.replace(/"/g, '""')}"`;
              })
              .join(',')
          ),
        ];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="orders-export-${Date.now()}.csv"`);
        return res.status(200).send(csvRows.join('\n'));
      }

      return ApiResponse.success(res, { orders: exportData, total: exportData.length }, 'Orders exported successfully');
    } catch (error) {
      next(error);
    }
  },
};

export default adminOrderController;
