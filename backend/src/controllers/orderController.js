import { Order, OrderItem, Payment, Shipment, Product, ProductImage, Coupon, Cart, CartItem, sequelize } from '../models/index.js';
import razorpayService from '../services/razorpayService.js';
import shiprocketService from '../services/shiprocketService.js';
import mailService from '../services/mailService.js';
import ApiResponse from '../utils/apiResponse.js';
import AppError from '../utils/customError.js';

const isUuid = (val) => Boolean(val && typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim()));

const getOrderWhereClause = (id) => {
  if (!id) return { id: null };
  const strId = String(id).trim();
  return isUuid(strId)
    ? { [sequelize.Sequelize.Op.or]: [{ id: strId }, { orderNumber: strId }] }
    : { orderNumber: strId };
};

export const orderController = {
  /**
   * 1. Calculate Dynamic Shipping Charge based on Delivery Pincode and Cart Subtotal
   */
  async calculateShipping(req, res, next) {
    try {
      const { pincode, subtotal = 0 } = req.body;

      if (!pincode || String(pincode).trim().length !== 6) {
        return ApiResponse.error(res, 'Valid 6-digit Pincode is required', 400);
      }

      // 1. Fetch live courier serviceability & rate from Shiprocket
      const rateInfo = await shiprocketService.checkServiceability({
        deliveryPincode: String(pincode).trim(),
        weight: 0.35,
      });

      // Temporary Free Shipping (₹0 charge for customer checkout)
      const effectiveRate = 0;

      return ApiResponse.success(
        res,
        {
          serviceable: rateInfo.serviceable,
          courierName: rateInfo.courierName,
          courierCompanyId: rateInfo.courierCompanyId,
          estimatedDays: rateInfo.estimatedDays,
          shippingAmount: 0,
          actualCourierRate: rateInfo.rate || 0,
          availableCouriers: rateInfo.allCouriers || [],
        },
        `Shiprocket rate: Free Delivery (₹0) via ${rateInfo.courierName}`
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 2. Create Payment Intent (Razorpay Order)
   * Validates address, items, coupon, shipping, and returns Razorpay order options.
   */
  async createPaymentIntent(req, res, next) {
    try {
      const { items, customerDetails, couponCode } = req.body;

      // 1. Validate Items
      if (!Array.isArray(items) || items.length === 0) {
        return ApiResponse.error(res, 'Your cart is empty. Please add items before checkout.', 400);
      }

      // 2. Validate Customer Details (Required for Shiprocket & Delivery)
      if (!customerDetails) {
        return ApiResponse.error(res, 'Shipping and customer details are required', 400);
      }

      const {
        customerName,
        customerMobile,
        customerEmail,
        shippingAddress,
        city,
        state,
        pincode,
      } = customerDetails;

      if (!customerName || customerName.trim().length < 2) {
        return ApiResponse.error(res, 'Please provide your full name', 400);
      }

      const cleanMobile = String(customerMobile || '').replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        return ApiResponse.error(res, 'Please provide a valid 10-digit mobile number', 400);
      }

      if (!shippingAddress || shippingAddress.trim().length < 6) {
        return ApiResponse.error(res, 'Please provide a complete street address (House/Flat, Road, Area)', 400);
      }

      if (!city || city.trim().length < 2) {
        return ApiResponse.error(res, 'City is required', 400);
      }

      if (!state || state.trim().length < 2) {
        return ApiResponse.error(res, 'State is required', 400);
      }

      const cleanPincode = String(pincode || '').trim();
      if (cleanPincode.length !== 6) {
        return ApiResponse.error(res, 'Please provide a valid 6-digit Pincode', 400);
      }

      // 3. Calculate Subtotal
      let subtotal = 0;
      for (const item of items) {
        const itemPrice = parseFloat(item.price || 0);
        const itemQty = parseInt(item.quantity || 1, 10);
        if (itemPrice <= 0 || itemQty <= 0) {
          return ApiResponse.error(res, `Invalid price or quantity for product "${item.productName || 'Item'}"`, 400);
        }
        subtotal += itemPrice * itemQty;
      }

      // 4. Calculate Coupon Discount if applied
      let discountAmount = 0;
      let validCoupon = null;
      if (couponCode && String(couponCode).trim()) {
        const cleanCode = String(couponCode).trim().toUpperCase();
        validCoupon = await Coupon.findOne({
          where: { code: cleanCode, isActive: true },
        });

        if (validCoupon) {
          const minOrder = parseFloat(validCoupon.minOrderAmount || 0);
          if (subtotal >= minOrder) {
            if (validCoupon.discountType === 'PERCENTAGE') {
              let calc = Math.round((subtotal * parseFloat(validCoupon.discountValue)) / 100);
              if (validCoupon.maxDiscountAmount && calc > parseFloat(validCoupon.maxDiscountAmount)) {
                calc = parseFloat(validCoupon.maxDiscountAmount);
              }
              discountAmount = calc;
            } else {
              // Flat Discount
              discountAmount = Math.min(subtotal, parseFloat(validCoupon.discountValue || 0));
            }
          }
        }
      }

      // 5. Calculate Shipping Charge (Temporarily 0 / Free Shipping)
      const rateInfo = await shiprocketService.checkServiceability({
        deliveryPincode: cleanPincode,
      });
      const shippingAmount = 0;

      const finalTotal = Math.max(0, subtotal - discountAmount + shippingAmount);

      // 6. Generate Unique Order Number
      const orderNumber = `TP-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

      // 7. Create Razorpay Order
      const rzpOrder = await razorpayService.createOrder({
        amount: finalTotal,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          customerName: customerName.trim(),
          customerMobile: cleanMobile,
          customerEmail: customerEmail || '',
          pincode: cleanPincode,
          orderNumber,
        },
      });

      return ApiResponse.success(
        res,
        {
          orderNumber,
          razorpayOrderId: rzpOrder.orderId,
          amount: rzpOrder.amount, // in paise
          currency: rzpOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_T54rFRRURtKx41',
          breakdown: {
            subtotal,
            discountAmount,
            shippingAmount,
            finalTotal,
            itemCount: items.length,
            couponCode: validCoupon ? validCoupon.code : null,
          },
          customerDetails: {
            customerName,
            customerMobile: cleanMobile,
            customerEmail,
            shippingAddress,
            city,
            state,
            pincode: cleanPincode,
          },
        },
        'Payment intent initialized successfully'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 3. Verify Payment & Create Order in DB & Shiprocket
   */
  async verifyPaymentAndCreateOrder(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderNumber,
        customerDetails,
        items,
        appliedCouponCode,
        amounts,
        guestSessionId,
      } = req.body;

      // 1. Verify Razorpay Payment Signature
      const isValidSignature = razorpayService.verifyPaymentSignature({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });

      if (!isValidSignature) {
        await transaction.rollback();
        return ApiResponse.error(res, 'Payment verification failed: Invalid transaction signature', 400);
      }

      // 1b. Resolve or Auto-Provision Customer User ID safely
      let userId = req.user?.id || null;

      if (!userId && (customerDetails.customerEmail || customerDetails.customerMobile)) {
        try {
          const cleanEmail = customerDetails.customerEmail ? String(customerDetails.customerEmail).trim().toLowerCase() : null;
          const cleanMobile = String(customerDetails.customerMobile || '').replace(/\D/g, '').slice(-10);

          let matchedUser = null;
          if (cleanEmail) {
            matchedUser = await User.findOne({ where: { email: cleanEmail }, transaction });
          }
          if (!matchedUser && cleanMobile && cleanMobile.length === 10) {
            matchedUser = await User.findOne({ where: { mobile: cleanMobile }, transaction });
          }

          if (!matchedUser) {
            // Auto-provision customer account for guest checkout
            matchedUser = await User.create(
              {
                name: (customerDetails.customerName || 'Customer').trim(),
                email: cleanEmail || null,
                mobile: (cleanMobile && cleanMobile.length === 10) ? cleanMobile : null,
                shippingAddress: customerDetails.shippingAddress ? customerDetails.shippingAddress.trim() : null,
                landmark: customerDetails.landmark ? customerDetails.landmark.trim() : null,
                city: customerDetails.city ? customerDetails.city.trim() : null,
                state: customerDetails.state ? customerDetails.state.trim() : null,
                pincode: customerDetails.pincode ? String(customerDetails.pincode).trim() : null,
                role: 'CUSTOMER',
                status: 'ACTIVE',
                lastLoginAt: new Date(),
              },
              { transaction }
            );
          } else {
            // Update existing user profile with latest address
            await matchedUser.update(
              {
                name: customerDetails.customerName?.trim() || matchedUser.name,
                shippingAddress: customerDetails.shippingAddress ? customerDetails.shippingAddress.trim() : matchedUser.shippingAddress,
                landmark: customerDetails.landmark ? customerDetails.landmark.trim() : matchedUser.landmark,
                city: customerDetails.city ? customerDetails.city.trim() : matchedUser.city,
                state: customerDetails.state ? customerDetails.state.trim() : matchedUser.state,
                pincode: customerDetails.pincode ? String(customerDetails.pincode).trim() : matchedUser.pincode,
              },
              { transaction }
            );
          }

          if (matchedUser) {
            userId = matchedUser.id;
          }
        } catch (userErr) {
          console.warn('[OrderController] User auto-provisioning warning (proceeding without userId):', userErr.message);
        }
      } else if (req.user) {
        try {
          await req.user.update(
            {
              name: customerDetails.customerName?.trim() || req.user.name,
              shippingAddress: customerDetails.shippingAddress?.trim() || req.user.shippingAddress,
              landmark: customerDetails.landmark?.trim() || req.user.landmark,
              city: customerDetails.city?.trim() || req.user.city,
              state: customerDetails.state?.trim() || req.user.state,
              pincode: customerDetails.pincode ? String(customerDetails.pincode).trim() : req.user.pincode,
            },
            { transaction }
          );
        } catch (err) {
          console.warn('[OrderController] Could not update req.user address:', err.message);
        }
      }

      const subtotalAmount = parseFloat(amounts?.subtotal || 0);
      const discountAmount = parseFloat(amounts?.discountAmount || 0);
      const shippingAmount = parseFloat(amounts?.shippingAmount || 0);
      const totalAmount = parseFloat(amounts?.finalTotal || subtotalAmount - discountAmount + shippingAmount);

      // 2. Create Order in Database
      const newOrder = await Order.create(
        {
          orderNumber: orderNumber || `TP-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`,
          userId: userId,
          status: 'PAYMENT_RECEIVED',
          customerName: customerDetails.customerName.trim(),
          customerMobile: customerDetails.customerMobile.trim(),
          customerEmail: customerDetails.customerEmail ? customerDetails.customerEmail.trim() : null,
          shippingAddress: customerDetails.shippingAddress.trim(),
          city: customerDetails.city.trim(),
          state: customerDetails.state.trim(),
          pincode: customerDetails.pincode.trim(),
          subtotalAmount,
          discountAmount,
          shippingAmount,
          totalAmount,
          paymentMethod: 'RAZORPAY',
          paymentStatus: 'PAID',
          appliedCouponCode: appliedCouponCode || null,
          notes: customerDetails.notes || 'Order placed via Online Checkout',
        },
        { transaction }
      );

      // 3. Create OrderItems
      const orderItemRecords = [];
      for (const item of items) {
        const itemQty = parseInt(item.quantity || 1, 10);
        const itemPrice = parseFloat(item.price || 0);
        const itemLineTotal = itemPrice * itemQty;

        const record = await OrderItem.create(
          {
            orderId: newOrder.id,
            productId: item.productId || item.id || null,
            productName: item.productName || item.name || 'Jewellery Item',
            sku: item.slug || `SKU-${item.productId || Date.now()}`,
            price: itemPrice,
            quantity: itemQty,
            totalPrice: itemLineTotal,
          },
          { transaction }
        );
        orderItemRecords.push(record);
      }

      // 4. Create Payment Record
      await Payment.create(
        {
          orderId: newOrder.id,
          paymentGateway: 'RAZORPAY',
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          gatewaySignature: razorpay_signature,
          amount: totalAmount,
          currency: 'INR',
          status: 'SUCCESS',
          gatewayResponse: {
            razorpay_order_id,
            razorpay_payment_id,
            verifiedAt: new Date().toISOString(),
          },
        },
        { transaction }
      );

      // 5. Update Coupon Usage Count if coupon used
      if (appliedCouponCode) {
        await Coupon.increment('usedCount', {
          by: 1,
          where: { code: appliedCouponCode },
          transaction,
        });
      }

      // 6. Clear User Cart (Authenticated or Guest)
      if (userId) {
        const userCart = await Cart.findOne({ where: { userId }, transaction });
        if (userCart) {
          await CartItem.destroy({ where: { cartId: userCart.id }, transaction });
        }
      } else if (guestSessionId) {
        const guestCart = await Cart.findOne({ where: { sessionId: guestSessionId }, transaction });
        if (guestCart) {
          await CartItem.destroy({ where: { cartId: guestCart.id }, transaction });
        }
      }

      // Commit DB transaction first
      await transaction.commit();

      // 7. Trigger Shiprocket Order Creation
      let shiprocketResult = null;
      try {
        shiprocketResult = await shiprocketService.createOrder(newOrder, orderItemRecords);
        if (shiprocketResult.success && shiprocketResult.shiprocketOrderId) {
          console.log(`[Shiprocket] Order #${newOrder.orderNumber} pushed to Shiprocket (OrderID: ${shiprocketResult.shiprocketOrderId}, ShipmentID: ${shiprocketResult.shiprocketShipmentId})`);
          await newOrder.update({
            shiprocketOrderId: shiprocketResult.shiprocketOrderId,
            shiprocketShipmentId: shiprocketResult.shiprocketShipmentId,
            awbCode: shiprocketResult.awbCode || null,
            courierName: shiprocketResult.courierName || null,
            status: 'PACKING',
          });

          // Create Shipment Record
          await Shipment.create({
            orderId: newOrder.id,
            courierName: shiprocketResult.courierName || 'Shiprocket Express',
            shiprocketOrderId: shiprocketResult.shiprocketOrderId,
            shiprocketShipmentId: shiprocketResult.shiprocketShipmentId,
            awbCode: shiprocketResult.awbCode || null,
            status: 'PENDING',
          });
        } else {
          console.warn(`[Shiprocket] Warning creating order #${newOrder.orderNumber}:`, shiprocketResult.message || shiprocketResult.data);
        }
      } catch (shipErr) {
        console.error(`[Shiprocket] Async Order Creation error for #${newOrder.orderNumber}:`, shipErr.message);
      }

      // Send Order Confirmation Email via ZeptoMail
      if (newOrder.customerEmail) {
        mailService
          .sendOrderConfirmationEmail({
            order: newOrder,
            customerEmail: newOrder.customerEmail,
            customerName: newOrder.customerName,
          })
          .catch((mErr) => console.warn(`[Mail] Confirmation email failed for #${newOrder.orderNumber}:`, mErr.message));
      }

      return ApiResponse.success(
        res,
        {
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          status: newOrder.status,
          totalAmount: newOrder.totalAmount,
          paymentStatus: newOrder.paymentStatus,
          customerName: newOrder.customerName,
          pincode: newOrder.pincode,
          shiprocketOrderId: newOrder.shiprocketOrderId || null,
          itemsCount: orderItemRecords.length,
        },
        'Order placed successfully 🎉'
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },

  /**
   * 4. Customer: Get My Orders List
   */
  async getMyOrders(req, res, next) {
    try {
      const user = req.user;
      const { email, mobile, orderNumber, orderIds } = req.query;

      const orConditions = [];
      if (user?.id) orConditions.push({ userId: user.id });
      if (user?.email) orConditions.push({ customerEmail: String(user.email).trim() });
      if (user?.mobile) orConditions.push({ customerMobile: String(user.mobile).trim() });

      if (email && String(email).trim()) {
        orConditions.push({ customerEmail: String(email).trim() });
      }
      if (mobile && String(mobile).trim()) {
        const cleanMob = String(mobile).trim().replace(/\D/g, '');
        if (cleanMob) {
          orConditions.push({ customerMobile: cleanMob });
        }
      }
      if (orderNumber && String(orderNumber).trim()) {
        orConditions.push({ orderNumber: String(orderNumber).trim() });
      }
      if (orderIds && typeof orderIds === 'string') {
        const idList = orderIds.split(',').map((s) => s.trim()).filter(Boolean);
        if (idList.length > 0) {
          orConditions.push({ orderNumber: { [sequelize.Sequelize.Op.in]: idList } });
        }
      }

      if (orConditions.length === 0) {
        return ApiResponse.success(res, [], 'No active session or query criteria provided');
      }

      const whereClause = { [sequelize.Sequelize.Op.or]: orConditions };

      const orders = await Order.findAll({
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
          { model: Shipment, as: 'shipment' },
          { model: Payment, as: 'payment', attributes: ['id', 'status', 'gatewayPaymentId'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Augment each order with cancellation eligibility
      const formatted = orders.map((o) => {
        const json = o.toJSON();
        // User can cancel ONLY when in ORDER_CREATED / PAYMENT_RECEIVED / PACKING AND label is NOT generated
        const canCancel =
          ['ORDER_CREATED', 'PAYMENT_RECEIVED', 'PACKING'].includes(o.status) &&
          !o.isLabelGenerated &&
          !o.awbCode;

        return {
          ...json,
          canCancel,
        };
      });

      return ApiResponse.success(res, formatted, 'Customer orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4b. Sync Live Shiprocket Tracking Status for Single Order (Customer)
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
        return ApiResponse.success(res, { order, liveTracking: null }, 'No AWB assigned yet. Live tracking will be available after dispatch.');
      }

      const syncResult = await shiprocketService.syncOrderTracking(order);

      return ApiResponse.success(
        res,
        {
          order: syncResult.order || order,
          liveTracking: syncResult.liveTracking,
          mappedStatus: syncResult.mappedStatus,
        },
        syncResult.message || 'Shiprocket live status synced successfully'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 5. Get Single Order Details by ID or Order Number
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
          { model: Shipment, as: 'shipment' },
          { model: Payment, as: 'payment' },
        ],
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      const canCancel =
        ['ORDER_CREATED', 'PAYMENT_RECEIVED', 'PACKING'].includes(order.status) &&
        !order.isLabelGenerated &&
        !order.awbCode;

      return ApiResponse.success(res, { ...order.toJSON(), canCancel }, 'Order details retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * 6. Cancel Order (Customer Cancellation Request)
   * Rule: User can cancel ONLY before label/AWB generation, pickup, or dispatch.
   * Cancels order in local DB, cancels in Shiprocket API automatically, restocks inventory, and initiates refund if prepaid.
   */
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason = 'Cancelled by customer' } = req.body;

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

      // Check Cancellation Eligibility
      if (order.status === 'CANCELLED') {
        return ApiResponse.error(res, 'This order is already cancelled', 400);
      }

      if (
        order.isLabelGenerated ||
        order.awbCode ||
        ['SHIPROCKET_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'].includes(order.status)
      ) {
        return ApiResponse.error(
          res,
          'Cannot cancel order. The shipping label has already been generated or courier pickup has been scheduled/dispatched. Please contact support.',
          400
        );
      }

      const isPrepaidPaid = order.paymentMethod === 'RAZORPAY' && order.paymentStatus === 'PAID';

      // 1. Update Order Status to CANCELLED
      await order.update({
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
        refundStatus: isPrepaidPaid ? 'REQUESTED' : 'NONE',
        refundReason: isPrepaidPaid ? `Order cancelled by customer: ${reason}` : null,
        refundAmount: isPrepaidPaid ? order.totalAmount : 0,
      });

      // 2. Update Shipment Record if present
      if (order.shipment) {
        await order.shipment.update({
          status: 'CANCELLED',
        });
      }

      // 3. Trigger Shiprocket order cancellation automatically
      let shiprocketCancelResult = null;
      try {
        shiprocketCancelResult = await shiprocketService.cancelOrder({
          shiprocketOrderId: order.shiprocketOrderId,
          awbCode: order.awbCode,
          shipmentId: order.shiprocketShipmentId || order.shipment?.shiprocketShipmentId,
          orderNumber: order.orderNumber,
        });
        console.log(`[Customer Cancel Order] Shiprocket cancellation result for #${order.orderNumber}:`, shiprocketCancelResult);
      } catch (srErr) {
        console.warn(`[Customer Cancel Order] Shiprocket order cancellation API notice for #${order.orderNumber}:`, srErr.message);
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
          .catch((mErr) => console.warn(`[Mail] Cancellation email failed for #${order.orderNumber}:`, mErr.message));
      }

      return ApiResponse.success(
        res,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'CANCELLED',
          refundStatus: isPrepaidPaid ? 'REQUESTED' : 'NONE',
          refundAmount: isPrepaidPaid ? order.totalAmount : 0,
          shiprocketCancellation: shiprocketCancelResult,
        },
        isPrepaidPaid
          ? 'Order has been cancelled successfully. Your refund request has been initiated.'
          : 'Order has been cancelled successfully.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 7. Customer: Request Refund for Cancelled Order
   */
  async requestRefund(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findOne({
        where: getOrderWhereClause(id),
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      if (order.status !== 'CANCELLED') {
        return ApiResponse.error(res, 'Refund can only be requested for cancelled orders', 400);
      }

      await order.update({
        refundStatus: 'REQUESTED',
        refundReason: reason || order.cancellationReason || 'Customer requested refund',
        refundAmount: order.totalAmount,
      });

      return ApiResponse.success(
        res,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          refundStatus: 'REQUESTED',
          refundAmount: order.totalAmount,
        },
        'Refund request submitted successfully. Our team will process it shortly.'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 8. Public Live Tracking (by Order Number & Phone)
   */
  async trackOrder(req, res, next) {
    try {
      const { orderNumber, phone } = req.query;

      if (!orderNumber) {
        return ApiResponse.error(res, 'Order Number is required', 400);
      }

      const whereClause = { orderNumber: String(orderNumber).trim() };
      if (phone) {
        whereClause.customerMobile = String(phone).trim();
      }

      const order = await Order.findOne({
        where: whereClause,
        include: [
          { model: OrderItem, as: 'items' },
          { model: Shipment, as: 'shipment' },
        ],
      });

      if (!order) {
        return ApiResponse.error(res, 'No order found with the provided details', 404);
      }

      // Check live tracking if AWB is available
      let liveTracking = null;
      if (order.awbCode) {
        liveTracking = await shiprocketService.trackShipment(order.awbCode);
      }

      return ApiResponse.success(
        res,
        {
          orderNumber: order.orderNumber,
          status: order.status,
          customerName: order.customerName,
          shippingAddress: `${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}`,
          courierName: order.courierName || 'Shiprocket Express',
          awbCode: order.awbCode || null,
          trackingUrl: order.trackingUrl || null,
          createdAt: order.createdAt,
          liveTracking,
        },
        'Tracking details retrieved'
      );
    } catch (error) {
      next(error);
    }
  },
};

export default orderController;
