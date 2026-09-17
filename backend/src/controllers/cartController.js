import { Op } from 'sequelize';
import { Cart, CartItem, Product, ProductImage, ProductVariant, Color, Size, Coupon } from '../models/index.js';
import logger from '../config/logger.js';

// Helper: Get or create active cart for User or Guest Session
const getOrCreateCart = async (userId, sessionId) => {
  let cart = null;
  if (userId) {
    cart = await Cart.findOne({
      where: { userId, status: 'ACTIVE' },
    });
    if (!cart) {
      cart = await Cart.create({ userId, status: 'ACTIVE' });
    }
  } else if (sessionId) {
    cart = await Cart.findOne({
      where: { sessionId, status: 'ACTIVE' },
    });
    if (!cart) {
      cart = await Cart.create({ sessionId, status: 'ACTIVE' });
    }
  }
  return cart;
};

// Helper: Standardized Cart Response Formatter
const formatCartResponse = async (cart) => {
  if (!cart) {
    return {
      cartId: null,
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
    };
  }

  const items = await CartItem.findAll({
    where: { cartId: cart.id },
    include: [
      {
        model: Product,
        as: 'product',
        include: [
          { model: ProductImage, as: 'images' },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  let subtotal = 0;
  const formattedItems = items.map((item) => {
    const salePrice = item.product?.salePrice !== undefined && item.product?.salePrice !== null ? parseFloat(item.product.salePrice) : null;
    const regularPrice = parseFloat(item.product?.price || item.priceSnapshot || 0);
    const hasDiscount = salePrice !== null && salePrice < regularPrice && regularPrice > 0;
    const finalPrice = parseFloat(item.priceSnapshot || (hasDiscount ? salePrice : regularPrice) || 0);
    const originalPrice = parseFloat(item.product?.mrp || (hasDiscount ? regularPrice : finalPrice * 1.4));
    const discount = item.product?.discountPercent || (originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);
    const lineTotal = finalPrice * item.quantity;
    subtotal += lineTotal;

    const img = item.product?.images?.find((i) => i.isPrimary)?.imageUrl || item.product?.images?.[0]?.imageUrl || '/images/storefront/cat-chains.jpg';

    return {
      id: item.id,
      productId: item.productId,
      productName: item.product?.name || 'Jewellery Product',
      slug: item.product?.slug || item.productId,
      imageUrl: img,
      badge: item.product?.badge || (item.product?.isBestSeller ? 'BESTSELLER' : null),
      categoryName: item.product?.subcategory?.name || 'Jewellery',
      price: finalPrice,
      mrp: originalPrice,
      discountPercent: discount,
      quantity: item.quantity,
      stock: item.product?.stock ?? 50,
      lineTotal,
      inStock: (item.product?.stock ?? 50) > 0,
      selected: true,
      createdAt: item.createdAt,
    };
  });

  const shipping = 0; // Calculated dynamically at checkout based on pincode
  const discount = 0;
  const total = Math.max(0, subtotal - discount);
  const itemCount = formattedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartId: cart.id,
    items: formattedItems,
    subtotal,
    discount,
    shipping,
    total,
    itemCount,
  };
};

// GET /api/v1/cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId || null;

    if (!userId && !sessionId) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          subtotal: 0,
          discount: 0,
          shipping: 0,
          total: 0,
          itemCount: 0,
        },
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    const cartData = await formatCartResponse(cart);

    return res.status(200).json({
      success: true,
      data: cartData,
    });
  } catch (error) {
    logger.error('Error in getCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve shopping cart',
      error: error.message,
    });
  }
};

// POST /api/v1/cart/items
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId || null;
    const { productId, quantity = 1, priceSnapshot } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    const finalPrice = priceSnapshot || product.salePrice || product.price || 0;

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      cartItem.quantity += parseInt(quantity, 10);
      cartItem.priceSnapshot = finalPrice;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: parseInt(quantity, 10),
        priceSnapshot: finalPrice,
      });
    }

    const cartData = await formatCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartData,
    });
  } catch (error) {
    logger.error('Error in addToCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    });
  }
};

// PUT /api/v1/cart/items/:id
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId || null;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    let cartItem = await CartItem.findByPk(id);
    if (!cartItem) {
      // Try searching by productId if id matches productId in active cart
      const cart = await getOrCreateCart(userId, sessionId);
      if (cart) {
        cartItem = await CartItem.findOne({
          where: { cartId: cart.id, productId: id },
        });
      }
    }

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    cartItem.quantity = parseInt(quantity, 10);
    await cartItem.save();

    const cart = await Cart.findByPk(cartItem.cartId);
    const cartData = await formatCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: 'Cart item quantity updated',
      data: cartData,
    });
  } catch (error) {
    logger.error('Error in updateCartItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
};

// DELETE /api/v1/cart/items/:id
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId || null;

    let cartItem = await CartItem.findByPk(id);
    let cartId = cartItem?.cartId;

    if (!cartItem) {
      // Fallback: search by productId for active cart
      const cart = await getOrCreateCart(userId, sessionId);
      if (cart) {
        cartItem = await CartItem.findOne({
          where: { cartId: cart.id, productId: id },
        });
        cartId = cart.id;
      }
    }

    if (cartItem) {
      await cartItem.destroy();
    }

    const cart = cartId ? await Cart.findByPk(cartId) : await getOrCreateCart(userId, sessionId);
    const cartData = await formatCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: 'Cart item removed successfully',
      data: cartData,
    });
  } catch (error) {
    logger.error('Error in removeCartItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message,
    });
  }
};

// POST /api/v1/cart/merge
export const mergeCart = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const guestSessionId = req.body.guestSessionId || req.headers['x-session-id'] || null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to merge cart' });
    }

    const userCart = await getOrCreateCart(userId, null);

    if (guestSessionId && guestSessionId !== userId) {
      const guestCart = await Cart.findOne({
        where: { sessionId: guestSessionId, status: 'ACTIVE' },
      });

      if (guestCart && guestCart.id !== userCart.id) {
        const guestItems = await CartItem.findAll({
          where: { cartId: guestCart.id },
        });

        for (const guestItem of guestItems) {
          const existingUserItem = await CartItem.findOne({
            where: { cartId: userCart.id, productId: guestItem.productId },
          });

          if (existingUserItem) {
            existingUserItem.quantity = (existingUserItem.quantity || 1) + (guestItem.quantity || 1);
            await existingUserItem.save();
            await guestItem.destroy();
          } else {
            guestItem.cartId = userCart.id;
            await guestItem.save();
          }
        }

        // Clean up empty guest cart
        await guestCart.destroy();
      }
    }

    const cartData = await formatCartResponse(userCart);
    return res.status(200).json({
      success: true,
      message: 'Cart merged successfully',
      data: cartData,
    });
  } catch (error) {
    logger.error('Error in mergeCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to merge cart',
      error: error.message,
    });
  }
};

// POST /api/v1/cart/clear
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.body.sessionId || null;
    const { itemIds } = req.body;

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return res.status(200).json({ success: true, message: 'Cart already empty' });
    }

    if (Array.isArray(itemIds) && itemIds.length > 0) {
      await CartItem.destroy({
        where: { cartId: cart.id, id: itemIds },
      });
    } else {
      await CartItem.destroy({
        where: { cartId: cart.id },
      });
    }

    const cartData = await formatCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cartData,
    });
  } catch (error) {
    logger.error('Error in clearCart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
};

// GET /api/v1/cart/available-coupons
export const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
      order: [['discountValue', 'DESC']],
      attributes: [
        'id',
        'code',
        'discountType',
        'discountValue',
        'minOrderAmount',
        'maxDiscountAmount',
        'startDate',
        'endDate',
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Available coupons retrieved successfully',
      data: { coupons },
    });
  } catch (error) {
    logger.error('Error in getAvailableCoupons:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available coupons',
      error: error.message,
    });
  }
};

// POST /api/v1/cart/apply-coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Built-in WELCOME10 coupon fallback
    if (cleanCode === 'WELCOME10') {
      const discount = Math.round(subtotal * 0.1);
      return res.status(200).json({
        success: true,
        message: 'Coupon WELCOME10 applied! 10% Discount applied.',
        data: {
          code: 'WELCOME10',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          discountAmount: discount,
        },
      });
    }

    const coupon = await Coupon.findOne({
      where: { code: cleanCode, isActive: true },
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: `Invalid or inactive coupon code "${cleanCode}"` });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({ success: false, message: 'This coupon is not active yet.' });
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon usage limit has been reached.' });
    }
    if (coupon.minOrderAmount && subtotal < parseFloat(coupon.minOrderAmount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ₹${coupon.minOrderAmount} required to use coupon "${coupon.code}". (Current: ₹${subtotal})`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * parseFloat(coupon.discountValue)) / 100);
      if (coupon.maxDiscountAmount && discountAmount > parseFloat(coupon.maxDiscountAmount)) {
        discountAmount = parseFloat(coupon.maxDiscountAmount);
      }
    } else {
      // FLAT discount in direct Rupees
      discountAmount = Math.min(subtotal, parseFloat(coupon.discountValue));
    }

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} applied! Saved ₹${discountAmount}.`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue),
        discountAmount,
      },
    });
  } catch (error) {
    logger.error('Error in applyCoupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to apply coupon',
      error: error.message,
    });
  }
};
