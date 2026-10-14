import { Order, OrderItem, Payment, Shipment, Product, ProductImage, User, sequelize } from '../../models/index.js';
import shiprocketService from '../../services/shiprocketService.js';
import shiprocketCronService from '../../services/shiprocketCronService.js';
import mailService from '../../services/mailService.js';
import razorpayService from '../../services/razorpayService.js';
import productService from '../services/productService.js';
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
                await Product.increment('stock', {
                  by: item.quantity,
                  where: { id: item.productId },
                });
                productService.syncProductToMeilisearch(item.productId).catch(() => {});
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
      const { reason = 'Cancelled by administrator', autoRefund = false } = req.body;

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
        include: [
          { model: Shipment, as: 'shipment' },
          { model: OrderItem, as: 'items' },
          { model: Payment, as: 'payment' },
        ],
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      if (order.status === 'CANCELLED') {
        return ApiResponse.error(res, 'This order is already cancelled', 400);
      }

      const isPrepaid = order.paymentMethod === 'RAZORPAY' && order.paymentStatus === 'PAID';
      let rzpRefundResult = null;
      let refundStatus = 'NONE';
      let paymentStatus = order.paymentStatus;
      let refundAmount = 0;

      if (isPrepaid) {
        refundAmount = parseFloat(order.totalAmount || 0);

        // Check if Admin requested automatic refund on cancel
        if (autoRefund) {
          let payment = order.payment;
          if (!payment) {
            payment = await Payment.findOne({
              where: { orderId: order.id },
              order: [['createdAt', 'DESC']],
            });
          }

          const gatewayPaymentId = payment?.gatewayPaymentId;
          if (gatewayPaymentId) {
            try {
              console.log(`[Admin Cancel Order] Issuing instant Razorpay refund for #${order.orderNumber} (PayID: ${gatewayPaymentId}, Amount: ₹${refundAmount})`);
              rzpRefundResult = await razorpayService.refundPayment({
                paymentId: gatewayPaymentId,
                amount: refundAmount,
                notes: {
                  orderNumber: order.orderNumber,
                  adminNote: `Cancelled by admin: ${reason}`,
                },
                receipt: `rfnd_${order.orderNumber}_${Date.now()}`.substring(0, 40),
              });

              refundStatus = 'PROCESSED';
              paymentStatus = 'REFUNDED';

              if (payment) {
                await payment.update({
                  status: 'REFUNDED',
                  gatewayResponse: {
                    ...(payment.gatewayResponse || {}),
                    refund: rzpRefundResult,
                  },
                });
              }
            } catch (err) {
              console.warn('[Admin Cancel Order] Auto Razorpay refund notice:', err.message);
              refundStatus = 'REQUESTED';
            }
          } else {
            refundStatus = 'REQUESTED';
          }
        } else {
          refundStatus = order.refundStatus === 'PROCESSED' ? 'PROCESSED' : 'REQUESTED';
        }
      }

      // 1. Update Order Status to CANCELLED
      const orderUpdates = {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
        refundStatus,
        paymentStatus,
        refundReason: isPrepaid ? `Admin cancelled: ${reason}` : null,
        refundAmount,
        refundProcessedAt: refundStatus === 'PROCESSED' ? new Date() : null,
      };

      if (rzpRefundResult) {
        orderUpdates.notes = `${order.notes || ''}\n[Razorpay Refund Issued on Cancel]: Refund ID: ${rzpRefundResult.refundId}, Amount: ₹${refundAmount}`.trim();
      }

      await order.update(orderUpdates);

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
              await Product.increment('stock', {
                by: item.quantity,
                where: { id: item.productId },
              });
              productService.syncProductToMeilisearch(item.productId).catch(() => {});
            } catch (stockErr) {
              console.warn(`Failed to restock product ${item.productId}:`, stockErr.message);
            }
          }
        }
      }

      // Send Order Cancellation / Refund Confirmation Email via ZeptoMail
      if (order.customerEmail) {
        if (rzpRefundResult) {
          mailService
            .sendRefundConfirmationEmail({
              order,
              customerEmail: order.customerEmail,
              customerName: order.customerName,
              refundAmount,
              refundId: rzpRefundResult.refundId,
              gateway: 'Razorpay',
              notes: `Order cancelled by store: ${reason}`,
            })
            .catch((mErr) => console.warn(`[Mail] Refund confirmation email failed:`, mErr.message));
        } else {
          mailService
            .sendOrderCancellationEmail({
              order,
              customerEmail: order.customerEmail,
              customerName: order.customerName,
              reason,
            })
            .catch((mErr) => console.warn(`[Mail] Admin cancel email failed for #${order.orderNumber}:`, mErr.message));
        }
      }

      return ApiResponse.success(
        res,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'CANCELLED',
          refundStatus: order.refundStatus,
          refundAmount: order.refundAmount,
          razorpayRefund: rzpRefundResult,
          shiprocketCancellation: shiprocketCancelResult,
        },
        `Order #${order.orderNumber} has been cancelled successfully${
          rzpRefundResult ? ` and ₹${refundAmount} refunded via Razorpay (Refund ID: ${rzpRefundResult.refundId})` : ''
        }${shiprocketCancelResult?.success ? ' and voided in Shiprocket' : ''}`
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

      // Check if AWB exists in Order or Shipment, or find in Shiprocket
      let awb = order.awbCode || order.shipment?.awbCode;
      if (!awb && order.orderNumber) {
        const found = await shiprocketService.findOrderByNumber(order.orderNumber);
        if (found?.awbCode) {
          awb = found.awbCode;
          await order.update({
            awbCode: awb,
            shiprocketOrderId: found.shiprocketOrderId || order.shiprocketOrderId,
            shiprocketShipmentId: found.shiprocketShipmentId || order.shiprocketShipmentId,
          });
          order.awbCode = awb;
        }
      }

      if (!awb) {
        return ApiResponse.success(
          res,
          {
            orderId: order.id,
            status: order.status,
            awbCode: null,
            trackingUrl: order.trackingUrl || null,
            liveTracking: order.shipment?.lastTrackingUpdate || null,
          },
          'No AWB assigned to this order yet. Please generate shipping label first.'
        );
      }

      const syncResult = await shiprocketService.syncOrderTracking(order);

      if (syncResult.success) {
        return ApiResponse.success(
          res,
          {
            orderId: order.id,
            status: syncResult.mappedStatus || order.status,
            awbCode: order.awbCode || awb,
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
          awbCode: order.awbCode || awb,
          trackingUrl: order.trackingUrl,
          liveTracking: syncResult.liveTracking || order.shipment?.lastTrackingUpdate || null,
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
   * 5. Process Refund Request for Order (Integrated with Razorpay Refund API)
   */
  async processRefund(req, res, next) {
    try {
      const { id } = req.params;
      const {
        refundStatus = 'PROCESSED',
        refundAmount,
        notes,
        autoRazorpayRefund = true,
      } = req.body;

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
        include: [
          { model: Payment, as: 'payment' },
          { model: OrderItem, as: 'items' },
          { model: Shipment, as: 'shipment' },
        ],
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      const effectiveRefundAmount =
        refundAmount !== undefined && refundAmount !== null && parseFloat(refundAmount) > 0
          ? parseFloat(refundAmount)
          : parseFloat(order.refundAmount || order.totalAmount || 0);

      const updates = {
        refundStatus,
        refundAmount: effectiveRefundAmount,
      };

      let razorpayRefundResult = null;

      if (refundStatus === 'PROCESSED') {
        updates.refundProcessedAt = new Date();

        // If paid via RAZORPAY and autoRazorpayRefund is true
        if (order.paymentMethod === 'RAZORPAY' && autoRazorpayRefund) {
          let payment = order.payment;
          if (!payment) {
            payment = await Payment.findOne({
              where: { orderId: order.id },
              order: [['createdAt', 'DESC']],
            });
          }

          const gatewayPaymentId = payment?.gatewayPaymentId;
          if (gatewayPaymentId) {
            try {
              console.log(
                `[Admin Refund] Executing Razorpay refund API for #${order.orderNumber} (PaymentID: ${gatewayPaymentId}, Amount: ₹${effectiveRefundAmount})`
              );
              razorpayRefundResult = await razorpayService.refundPayment({
                paymentId: gatewayPaymentId,
                amount: effectiveRefundAmount,
                notes: {
                  orderNumber: order.orderNumber,
                  adminNote: notes || 'Admin initiated refund',
                },
                receipt: `rfnd_${order.orderNumber}_${Date.now()}`.substring(0, 40),
              });

              console.log(
                `[Admin Refund] Razorpay refund successful for #${order.orderNumber}:`,
                razorpayRefundResult.refundId
              );

              // Update Payment record
              if (payment) {
                const prevResponses = payment.gatewayResponse || {};
                await payment.update({
                  status: 'REFUNDED',
                  gatewayResponse: {
                    ...prevResponses,
                    refund: razorpayRefundResult,
                  },
                });
              }

              updates.paymentStatus = 'REFUNDED';
              updates.notes = `${order.notes || ''}\n[Razorpay Refund Processed]: Refund ID: ${razorpayRefundResult.refundId}, Amount: ₹${effectiveRefundAmount}, Status: ${razorpayRefundResult.status}`.trim();
            } catch (rzpErr) {
              console.error(`[Admin Refund] Razorpay refund API failed for #${order.orderNumber}:`, rzpErr.message);
              return ApiResponse.error(
                res,
                `Razorpay Refund API Error: ${rzpErr.message}. The refund could not be processed automatically.`,
                400
              );
            }
          } else {
            console.warn(
              `[Admin Refund] No gatewayPaymentId linked to order #${order.orderNumber}. Processing refund record only.`
            );
            updates.paymentStatus = 'REFUNDED';
            updates.notes = `${order.notes || ''}\n[Manual Refund Recorded]: Amount: ₹${effectiveRefundAmount} (No Razorpay gatewayPaymentId linked)`.trim();
          }
        } else {
          // COD or manual transfer
          updates.paymentStatus = 'REFUNDED';
          if (notes) {
            updates.notes = `${order.notes || ''}\n[Refund Note]: ${notes}`.trim();
          }
        }

        // Send Refund Confirmation Email via ZeptoMail
        if (order.customerEmail) {
          mailService
            .sendRefundConfirmationEmail({
              order,
              customerEmail: order.customerEmail,
              customerName: order.customerName,
              refundAmount: effectiveRefundAmount,
              refundId: razorpayRefundResult?.refundId || null,
              gateway: order.paymentMethod === 'RAZORPAY' ? 'Razorpay' : 'Direct Account Transfer',
              notes: notes || 'Refund processed by store administration.',
            })
            .catch((mErr) =>
              console.warn(`[Mail] Refund confirmation email notice for #${order.orderNumber}:`, mErr.message)
            );
        }
      } else {
        if (notes) {
          updates.notes = `${order.notes || ''}\n[Refund Status Update]: ${refundStatus} - ${notes}`.trim();
        }
      }

      await order.update(updates);

      return ApiResponse.success(
        res,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          refundStatus: order.refundStatus,
          paymentStatus: order.paymentStatus,
          refundAmount: order.refundAmount,
          refundProcessedAt: order.refundProcessedAt,
          razorpayRefund: razorpayRefundResult,
        },
        razorpayRefundResult
          ? `Refund of ₹${effectiveRefundAmount} issued successfully via Razorpay (Refund ID: ${razorpayRefundResult.refundId})! Amount will automatically credit to customer's account.`
          : `Refund status updated to "${refundStatus}"`
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
