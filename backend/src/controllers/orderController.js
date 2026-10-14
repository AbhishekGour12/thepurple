import { Op } from 'sequelize';
import { Order, OrderItem, Payment, Shipment, Product, ProductImage, Coupon, Cart, CartItem, User, sequelize } from '../models/index.js';
import razorpayService from '../services/razorpayService.js';
import shiprocketService from '../services/shiprocketService.js';
import mailService from '../services/mailService.js';
import productService from '../admin/services/productService.js';
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
      const { pincode, subtotal = 0, couponCode, email, mobile } = req.body;

      if (!pincode || String(pincode).trim().length !== 6) {
        return ApiResponse.error(res, 'Valid 6-digit Pincode is required', 400);
      }

      const cleanPin = String(pincode).trim();
      const numSubtotal = parseFloat(subtotal) || 0;

      // 1. Fetch live courier serviceability & rate from Shiprocket
      const rateInfo = await shiprocketService.checkServiceability({
        deliveryPincode: cleanPin,
        weight: 0.35,
      });

      const actualRate = parseFloat(rateInfo.rate || 70);

      // 2. Check for active Free Shipping coupon or Auto-apply Free Shipping rule
      const now = new Date();
      let isFreeShipping = false;
      let appliedOfferReason = null;

      // Build customer identity conditions to check per-user redemption limit
      const checkUserId = req.user?.id;
      const checkEmail = (req.user?.email || email || '').trim().toLowerCase();
      const checkMobile = String(req.user?.mobile || mobile || '').replace(/\D/g, '').slice(-10);

      const userConditions = [];
      if (checkUserId) userConditions.push({ userId: checkUserId });
      if (checkEmail) userConditions.push({ customerEmail: { [Op.iLike]: checkEmail } });
      if (checkMobile && checkMobile.length === 10) userConditions.push({ customerMobile: { [Op.iLike]: `%${checkMobile}` } });

      // Check explicit couponCode if sent
      if (couponCode && String(couponCode).trim()) {
        const cleanCode = String(couponCode).trim().toUpperCase();
        const coupon = await Coupon.findOne({
          where: {
            code: cleanCode,
            isActive: true,
            startDate: { [sequelize.Sequelize.Op.lte]: now },
            endDate: { [sequelize.Sequelize.Op.gte]: now },
          },
        });
        if (coupon && coupon.discountType === 'FREE_SHIPPING' && numSubtotal >= parseFloat(coupon.minOrderAmount || 0)) {
          let canApply = true;
          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            canApply = false;
          }
          if (canApply && coupon.usageLimitPerUser && coupon.usageLimitPerUser > 0 && userConditions.length > 0) {
            const userOrdersCount = await Order.count({
              where: {
                appliedCouponCode: { [Op.iLike]: cleanCode },
                paymentStatus: { [Op.ne]: 'FAILED' },
                status: { [Op.ne]: 'CANCELLED' },
                [Op.or]: userConditions,
              },
            });
            if (userOrdersCount >= coupon.usageLimitPerUser) {
              canApply = false;
            }
          }

          if (canApply) {
            isFreeShipping = true;
            appliedOfferReason = `Free Shipping coupon "${coupon.code}" applied`;
          }
        }
      }

      // Check any active auto-applied FREE_SHIPPING coupon where subtotal >= minOrderAmount
      if (!isFreeShipping) {
        const autoCoupons = await Coupon.findAll({
          where: {
            discountType: 'FREE_SHIPPING',
            isAutoApply: true,
            isActive: true,
            startDate: { [sequelize.Sequelize.Op.lte]: now },
            endDate: { [sequelize.Sequelize.Op.gte]: now },
            minOrderAmount: { [sequelize.Sequelize.Op.lte]: numSubtotal },
          },
          order: [['minOrderAmount', 'ASC']],
        });

        for (const ac of autoCoupons) {
          // Check global usage limit
          if (ac.usageLimit && ac.usedCount >= ac.usageLimit) continue;

          // Check per-user redemption limit!
          if (ac.usageLimitPerUser && ac.usageLimitPerUser > 0 && userConditions.length > 0) {
            const userOrdersCount = await Order.count({
              where: {
                appliedCouponCode: { [Op.iLike]: ac.code.trim().toUpperCase() },
                paymentStatus: { [Op.ne]: 'FAILED' },
                status: { [Op.ne]: 'CANCELLED' },
                [Op.or]: userConditions,
              },
            });
            if (userOrdersCount >= ac.usageLimitPerUser) {
              continue; // Exceeded per-user limit!
            }
          }

          isFreeShipping = true;
          appliedOfferReason = `Free Shipping unlocked on orders above ₹${ac.minOrderAmount} (Code: ${ac.code})`;
          break;
        }
      }

      const effectiveRate = isFreeShipping ? 0 : actualRate;

      return ApiResponse.success(
        res,
        {
          serviceable: rateInfo.serviceable,
          courierName: rateInfo.courierName,
          courierCompanyId: rateInfo.courierCompanyId,
          estimatedDays: rateInfo.estimatedDays,
          shippingAmount: effectiveRate,
          actualCourierRate: actualRate,
          isFreeShipping,
          appliedOfferReason,
          availableCouriers: rateInfo.allCouriers || [],
        },
        isFreeShipping
          ? `${appliedOfferReason || 'Free Delivery unlocked'} (Courier: ${rateInfo.courierName})`
          : `Shiprocket rate: ₹${effectiveRate} via ${rateInfo.courierName}`
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

      // 3. Calculate Subtotal, Validate Stock Availability & Check Min Cart Value
      let subtotal = 0;
      let maxRequiredMinCart = 0;
      let minCartProduct = null;

      for (const item of items) {
        const itemPrice = parseFloat(item.price || 0);
        const itemQty = parseInt(item.quantity || 1, 10);
        if (itemPrice <= 0 || itemQty <= 0) {
          return ApiResponse.error(res, `Invalid price or quantity for product "${item.productName || 'Item'}"`, 400);
        }

        const prodId = item.productId || item.id;
        if (prodId && isUuid(String(prodId))) {
          const product = await Product.findByPk(prodId);
          if (!product) {
            return ApiResponse.error(res, `Product "${item.productName || 'Selected Item'}" is no longer available`, 400);
          }
          if (product.stock < itemQty) {
            return ApiResponse.error(
              res,
              `Insufficient stock for "${product.name}". Only ${product.stock} item(s) available in inventory.`,
              400
            );
          }
          if (product.minCartValue && parseFloat(product.minCartValue) > 0) {
            const reqMin = parseFloat(product.minCartValue);
            if (reqMin > maxRequiredMinCart) {
              maxRequiredMinCart = reqMin;
              minCartProduct = product;
            }
          }
        }

        subtotal += itemPrice * itemQty;
      }

      // Check if Minimum Cart Value requirement is satisfied
      if (maxRequiredMinCart > 0 && subtotal < maxRequiredMinCart) {
        const remaining = (maxRequiredMinCart - subtotal).toFixed(2);
        return ApiResponse.error(
          res,
          `"${minCartProduct?.name || 'A product in your cart'}" requires a minimum cart total of ₹${maxRequiredMinCart.toLocaleString('en-IN')}. Your current cart total is ₹${subtotal.toLocaleString('en-IN')}. Please add items worth ₹${remaining} more to checkout.`,
          400
        );
      }

      // 4. Calculate Coupon Discount if applied
      let discountAmount = 0;
      let isCouponFreeShipping = false;
      let validCoupon = null;
      if (couponCode && String(couponCode).trim()) {
        const cleanCode = String(couponCode).trim().toUpperCase();
        validCoupon = await Coupon.findOne({
          where: { code: cleanCode, isActive: true },
        });

        if (validCoupon) {
          // 1. Check Total Usage Limit
          if (validCoupon.usageLimit && validCoupon.usedCount >= validCoupon.usageLimit) {
            return res.status(400).json({
              success: false,
              message: `Coupon "${cleanCode}" total usage limit has been reached.`,
            });
          }

          // 2. Check Per-User Redemption Limit
          const effectiveUserId = req.user?.id || customerDetails?.userId;
          const userConditions = [];
          if (effectiveUserId) {
            userConditions.push({ userId: effectiveUserId });
          }
          if (cleanMobile && cleanMobile.length === 10) {
            userConditions.push({ customerMobile: { [Op.iLike]: `%${cleanMobile}` } });
          }
          if (customerEmail && customerEmail.trim()) {
            userConditions.push({ customerEmail: { [Op.iLike]: customerEmail.trim() } });
          }

          if (validCoupon.usageLimitPerUser && validCoupon.usageLimitPerUser > 0 && userConditions.length > 0) {
            const userOrdersCount = await Order.count({
              where: {
                appliedCouponCode: { [Op.iLike]: cleanCode },
                paymentStatus: { [Op.ne]: 'FAILED' },
                status: { [Op.ne]: 'CANCELLED' },
                [Op.or]: userConditions,
              },
            });

            if (userOrdersCount >= validCoupon.usageLimitPerUser) {
              return res.status(400).json({
                success: false,
                message: `You have already redeemed coupon "${validCoupon.code}" (Limit: ${validCoupon.usageLimitPerUser} time${validCoupon.usageLimitPerUser > 1 ? 's' : ''} per customer).`,
              });
            }
          }

          const minOrder = parseFloat(validCoupon.minOrderAmount || 0);
          if (subtotal >= minOrder) {
            if (validCoupon.discountType === 'PERCENTAGE') {
              let calc = Math.round((subtotal * parseFloat(validCoupon.discountValue)) / 100);
              if (validCoupon.maxDiscountAmount && calc > parseFloat(validCoupon.maxDiscountAmount)) {
                calc = parseFloat(validCoupon.maxDiscountAmount);
              }
              discountAmount = calc;
            } else if (validCoupon.discountType === 'FREE_SHIPPING') {
              isCouponFreeShipping = true;
              discountAmount = 0;
            } else {
              // Flat Discount
              discountAmount = Math.min(subtotal, parseFloat(validCoupon.discountValue || 0));
            }
          }
        }
      }

      // Check auto-applied FREE_SHIPPING coupon if not already free
      if (!isCouponFreeShipping) {
        const now = new Date();
        const autoCoupons = await Coupon.findAll({
          where: {
            discountType: 'FREE_SHIPPING',
            isAutoApply: true,
            isActive: true,
            startDate: { [sequelize.Sequelize.Op.lte]: now },
            endDate: { [sequelize.Sequelize.Op.gte]: now },
            minOrderAmount: { [sequelize.Sequelize.Op.lte]: subtotal },
          },
          order: [['minOrderAmount', 'ASC']],
        });

        for (const ac of autoCoupons) {
          if (ac.usageLimit && ac.usedCount >= ac.usageLimit) continue;
          if (ac.usageLimitPerUser && ac.usageLimitPerUser > 0 && userConditions.length > 0) {
            const userOrdersCount = await Order.count({
              where: {
                appliedCouponCode: { [Op.iLike]: ac.code.trim().toUpperCase() },
                paymentStatus: { [Op.ne]: 'FAILED' },
                status: { [Op.ne]: 'CANCELLED' },
                [Op.or]: userConditions,
              },
            });
            if (userOrdersCount >= ac.usageLimitPerUser) {
              continue; // Exceeded limit for this customer!
            }
          }
          isCouponFreeShipping = true;
          if (!validCoupon) validCoupon = ac;
          break;
        }
      }

      // 5. Calculate Real Shiprocket Shipping Charge
      const rateInfo = await shiprocketService.checkServiceability({
        deliveryPincode: cleanPincode,
        weight: 0.35,
      });
      const actualCourierRate = parseFloat(rateInfo.rate || 70);
      const shippingAmount = isCouponFreeShipping ? 0 : actualCourierRate;

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
          appliedCouponCode: (appliedCouponCode || amounts?.couponCode) ? String(appliedCouponCode || amounts?.couponCode).trim().toUpperCase() : null,
          notes: customerDetails.notes || 'Order placed via Online Checkout',
        },
        { transaction }
      );

      // 3. Create OrderItems and Deduct Product Stock
      const orderItemRecords = [];
      const updatedProductIds = [];
      for (const item of items) {
        const itemQty = parseInt(item.quantity || 1, 10);
        const itemPrice = parseFloat(item.price || 0);
        const itemLineTotal = itemPrice * itemQty;
        const prodId = item.productId || item.id || null;

        const record = await OrderItem.create(
          {
            orderId: newOrder.id,
            productId: prodId,
            productName: item.productName || item.name || 'Jewellery Item',
            sku: item.slug || `SKU-${item.productId || Date.now()}`,
            price: itemPrice,
            quantity: itemQty,
            totalPrice: itemLineTotal,
          },
          { transaction }
        );
        orderItemRecords.push(record);

        // Deduct inventory stock from Product
        if (prodId && isUuid(String(prodId))) {
          const product = await Product.findByPk(prodId, { transaction });
          if (product) {
            const newStock = Math.max(0, (product.stock || 0) - itemQty);
            await product.update({ stock: newStock }, { transaction });
            updatedProductIds.push(prodId);
          }
        }
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
      const finalCodeToIncrement = appliedCouponCode || amounts?.couponCode;
      if (finalCodeToIncrement) {
        const cleanCouponCode = String(finalCodeToIncrement).trim().toUpperCase();
        await Coupon.increment('usedCount', {
          by: 1,
          where: {
            code: { [Op.iLike]: cleanCouponCode },
          },
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

      // Asynchronously synchronize updated inventory stock to Meilisearch
      for (const pId of updatedProductIds) {
        productService.syncProductToMeilisearch(pId).catch((err) => {
          console.warn(`[OrderController] Meilisearch sync notice for product ${pId}:`, err.message);
        });
      }

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

      // Augment each order - Customer self-service cancellation is disabled per policy
      const formatted = orders.map((o) => {
        const json = o.toJSON();
        return {
          ...json,
          canCancel: false,
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

      const syncResult = await shiprocketService.syncOrderTracking(order);

      return ApiResponse.success(
        res,
        {
          order: syncResult.order || order,
          liveTracking: syncResult.liveTracking,
          mappedStatus: syncResult.mappedStatus || order.status,
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

      return ApiResponse.success(res, { ...order.toJSON(), canCancel: false }, 'Order details retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * 6. Cancel Order (Customer Cancellation Request - Disabled per policy)
   */
  async cancelOrder(req, res, next) {
    return ApiResponse.error(
      res,
      'Self-service order cancellation is disabled. Please contact customer support for cancellations and refunds.',
      403
    );
  },

  /**
   * 7. Customer: Request Refund (Disabled per policy)
   */
  async requestRefund(req, res, next) {
    return ApiResponse.error(
      res,
      'Self-service refund requests are disabled. Please contact customer support for assistance.',
      403
    );
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
      const effectiveAwb = order.awbCode || order.shipment?.awbCode;
      if (effectiveAwb) {
        liveTracking = await shiprocketService.trackShipment(effectiveAwb);
        if (liveTracking?.success && liveTracking.orderStatus && liveTracking.orderStatus !== order.status) {
          await order.update({ status: liveTracking.orderStatus });
          order.status = liveTracking.orderStatus;
        }
      }

      return ApiResponse.success(
        res,
        {
          orderNumber: order.orderNumber,
          status: order.status,
          customerName: order.customerName,
          shippingAddress: `${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}`,
          courierName: liveTracking?.courierName || order.courierName || 'Shiprocket Express',
          awbCode: effectiveAwb || null,
          trackingUrl: liveTracking?.trackUrl || order.trackingUrl || null,
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
