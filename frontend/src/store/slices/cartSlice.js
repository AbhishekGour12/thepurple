import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '@/lib/api/cart';

const STORAGE_KEY = 'thepurple_cart_v2';

// Safe LocalStorage helpers
const loadStoredCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load cart from localStorage:', e);
  }
  return [];
};

const saveCartToStorage = (items) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }
};

// ─── Async Thunks (Backend Database Sync) ───────────────────────────────────

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const data = await cartApi.getCart();
    if (data?.items) {
      saveCartToStorage(data.items);
      return data;
    }
    return { items: loadStoredCart() };
  } catch (err) {
    return { items: loadStoredCart() };
  }
});

export const syncAddToCart = createAsyncThunk(
  'cart/syncAddToCart',
  async ({ productId, quantity = 1, priceSnapshot }, { rejectWithValue }) => {
    try {
      const data = await cartApi.addItem({ productId, quantity, priceSnapshot });
      if (data?.items) {
        saveCartToStorage(data.items);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add item to database cart');
    }
  }
);

export const syncUpdateQuantity = createAsyncThunk(
  'cart/syncUpdateQuantity',
  async ({ id, productId, quantity }, { rejectWithValue }) => {
    try {
      const targetId = id || productId;
      const data = await cartApi.updateItem(targetId, quantity);
      if (data?.items) {
        saveCartToStorage(data.items);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update quantity in database');
    }
  }
);

export const syncRemoveFromCart = createAsyncThunk(
  'cart/syncRemoveFromCart',
  async (idOrProductId, { rejectWithValue }) => {
    try {
      const data = await cartApi.removeItem(idOrProductId);
      if (data?.items) {
        saveCartToStorage(data.items);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to remove item from database');
    }
  }
);

export const syncClearCart = createAsyncThunk(
  'cart/syncClearCart',
  async (itemIds = [], { rejectWithValue }) => {
    try {
      const data = await cartApi.clearCart(itemIds);
      if (data?.items) {
        saveCartToStorage(data.items);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to clear cart in database');
    }
  }
);

export const syncMergeCart = createAsyncThunk(
  'cart/syncMergeCart',
  async (guestSessionId, { rejectWithValue }) => {
    try {
      const data = await cartApi.mergeCart(guestSessionId);
      if (data?.items) {
        saveCartToStorage(data.items);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to merge cart');
    }
  }
);

export const syncApplyCoupon = createAsyncThunk(
  'cart/syncApplyCoupon',
  async ({ code, subtotal }, { rejectWithValue }) => {
    try {
      const data = await cartApi.applyCoupon(code, subtotal);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Invalid coupon');
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  cartId: null,
  loading: false,
  appliedCoupon: {
    code: 'WELCOME10',
    discountAmount: 0,
    discountPercent: 10,
    isApplied: true,
  },
  isCouponLoading: false,
  couponError: null,
  couponSuccess: 'Special Offer Just For You! Get 10% OFF on your first order. Use Code: WELCOME10',
};

// ─── Slice Definition ─────────────────────────────────────────────────────────

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // 0. Hydrate cart from localStorage on page load
    hydrateCart: (state) => {
      if (typeof window !== 'undefined') {
        const cached = loadStoredCart();
        if (cached && cached.length > 0) {
          state.items = cached;
        }
      }
    },

    // 1. Optimistic Add to Cart (Instant UI)
    addToCart: (state, action) => {
      const payload = action.payload;
      if (!payload) return;

      const prodId = String(payload.productId || payload.id);
      const selectedSize = payload.selectedSize || 'Standard';
      const selectedColor = payload.selectedColor || 'Gold';

      const existingIdx = state.items.findIndex(
        (item) =>
          String(item.productId) === prodId ||
          String(item.id) === prodId ||
          (payload.slug && item.slug === payload.slug)
      );

      if (existingIdx >= 0) {
        state.items[existingIdx].quantity += payload.quantity || 1;
      } else {
        const salePrice = parseFloat(payload.price || payload.salePrice || 0);
        const originalPrice = parseFloat(payload.mrp || payload.originalPrice || salePrice * 1.4);
        const discount =
          payload.discountPercent ||
          (originalPrice > salePrice && originalPrice > 0
            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
            : 0);

        const newItem = {
          id: payload.id ? String(payload.id) : `cart-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          productId: prodId,
          variantId: payload.variantId || null,
          productName: payload.name || payload.productName || 'Jewellery Product',
          slug: payload.slug || '',
          categoryName: payload.categoryName || payload.category || payload.subcategory?.name || 'Jewellery',
          selectedSize: selectedSize,
          selectedColor: selectedColor,
          metaSubtitle:
            payload.metaSubtitle ||
            `${payload.categoryName || payload.category || 'Jewellery'} | ${selectedSize} | ${selectedColor}`,
          imageUrl: payload.imageUrl || payload.image || (Array.isArray(payload.images) && payload.images[0]?.imageUrl) || (Array.isArray(payload.images) && payload.images[0]) || '/images/storefront/prod-gold-rope.jpg',
          badge: payload.badge || null,
          price: salePrice,
          mrp: originalPrice,
          discountPercent: discount,
          quantity: Math.max(1, parseInt(payload.quantity, 10) || 1),
          inStock: payload.inStock !== undefined ? payload.inStock : true,
          stock: payload.stock || 20,
          selected: true,
        };
        state.items.unshift(newItem);
      }

      saveCartToStorage(state.items);
    },

    // 2. Optimistic Update quantity
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const target = state.items.find((item) => String(item.id) === String(id) || String(item.productId) === String(id));
      if (target) {
        target.quantity = Math.max(1, parseInt(quantity, 10) || 1);
        saveCartToStorage(state.items);
      }
    },

    // 3. Optimistic Remove single item
    removeFromCart: (state, action) => {
      const target = String(action.payload);
      state.items = state.items.filter(
        (item) => String(item.id) !== target && String(item.productId) !== target && item.slug !== target
      );
      saveCartToStorage(state.items);
    },

    // 3b. Toggle item in cart
    toggleCartItem: (state, action) => {
      const payload = action.payload;
      if (!payload) return;
      const prodId = String(payload.productId || payload.id);
      const existingIdx = state.items.findIndex(
        (item) =>
          String(item.productId) === prodId ||
          String(item.id) === prodId ||
          (payload.slug && item.slug === payload.slug)
      );

      if (existingIdx >= 0) {
        state.items.splice(existingIdx, 1);
        saveCartToStorage(state.items);
      } else {
        const salePrice = parseFloat(payload.price || payload.salePrice || 0);
        const originalPrice = parseFloat(payload.mrp || payload.originalPrice || salePrice * 1.4);
        const discount =
          payload.discountPercent ||
          (originalPrice > salePrice && originalPrice > 0
            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
            : 0);

        const newItem = {
          id: payload.id ? String(payload.id) : `cart-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          productId: prodId,
          variantId: payload.variantId || null,
          productName: payload.name || payload.productName || 'Jewellery Product',
          slug: payload.slug || '',
          categoryName: payload.categoryName || payload.category || payload.subcategory?.name || 'Jewellery',
          selectedSize: payload.selectedSize || 'Standard',
          selectedColor: payload.selectedColor || 'Gold',
          metaSubtitle:
            payload.metaSubtitle ||
            `${payload.categoryName || payload.category || 'Jewellery'} | ${payload.selectedSize || 'Standard'} | ${payload.selectedColor || 'Gold'}`,
          imageUrl: payload.imageUrl || payload.image || (Array.isArray(payload.images) && payload.images[0]?.imageUrl) || (Array.isArray(payload.images) && payload.images[0]) || '/images/storefront/prod-gold-rope.jpg',
          badge: payload.badge || null,
          price: salePrice,
          mrp: originalPrice,
          discountPercent: discount,
          quantity: Math.max(1, parseInt(payload.quantity, 10) || 1),
          inStock: payload.inStock !== undefined ? payload.inStock : true,
          stock: payload.stock || 20,
          selected: true,
        };
        state.items.unshift(newItem);
        saveCartToStorage(state.items);
      }
    },

    // 4. Toggle select single item
    toggleSelectItem: (state, action) => {
      const id = String(action.payload);
      const target = state.items.find((item) => String(item.id) === id || String(item.productId) === id);
      if (target) {
        target.selected = !target.selected;
        saveCartToStorage(state.items);
      }
    },

    // 5. Select All / Deselect All items
    selectAllItems: (state, action) => {
      const isSelected = action.payload;
      state.items.forEach((item) => {
        item.selected = isSelected;
      });
      saveCartToStorage(state.items);
    },

    // 6. Remove Selected items
    removeSelectedItems: (state) => {
      state.items = state.items.filter((item) => !item.selected);
      saveCartToStorage(state.items);
    },

    // 7. Apply coupon code
    applyCouponCode: (state, action) => {
      const code = (action.payload || '').trim().toUpperCase();
      state.couponError = null;

      if (!code) {
        state.couponError = 'Please enter a valid coupon code.';
        return;
      }

      if (code === 'WELCOME10') {
        state.appliedCoupon = {
          code: 'WELCOME10',
          discountAmount: 0,
          discountPercent: 10,
          isApplied: true,
        };
        state.couponSuccess = 'Coupon WELCOME10 applied! 10% Discount applied.';
      } else if (code === 'PURPLE20') {
        state.appliedCoupon = {
          code: 'PURPLE20',
          discountAmount: 0,
          discountPercent: 20,
          isApplied: true,
        };
        state.couponSuccess = 'Coupon PURPLE20 applied! 20% Discount applied.';
      } else if (code === 'GOLD500') {
        state.appliedCoupon = {
          code: 'GOLD500',
          discountAmount: 500,
          discountPercent: 0,
          isApplied: true,
        };
        state.couponSuccess = 'Coupon GOLD500 applied! Flat ₹500 OFF.';
      } else {
        state.couponError = 'Invalid or expired coupon code. Try code "WELCOME10".';
      }
    },

    // 8. Remove coupon
    removeCouponCode: (state) => {
      state.appliedCoupon = null;
      state.couponSuccess = null;
      state.couponError = null;
    },

    // 9. Clear all cart
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
  },
  extraReducers: (builder) => {
    // ── fetchCart ─────────────────────────────────────────────────────────────
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.items && Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
          state.cartId = action.payload.cartId || state.cartId;
        }
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })

      // ── syncAddToCart ───────────────────────────────────────────────────────
      .addCase(syncAddToCart.fulfilled, (state, action) => {
        if (action.payload?.items && Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
          state.cartId = action.payload.cartId || state.cartId;
        }
      })

      // ── syncUpdateQuantity ──────────────────────────────────────────────────
      .addCase(syncUpdateQuantity.fulfilled, (state, action) => {
        if (action.payload?.items && Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
        }
      })

      // ── syncRemoveFromCart ──────────────────────────────────────────────────
      .addCase(syncRemoveFromCart.fulfilled, (state, action) => {
        if (action.payload?.items && Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
        }
      })

      // ── syncClearCart ───────────────────────────────────────────────────────
      .addCase(syncClearCart.fulfilled, (state, action) => {
        if (action.payload?.items && Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
        }
      })

      // ── syncMergeCart ───────────────────────────────────────────────────────
      .addCase(syncMergeCart.fulfilled, (state, action) => {
        if (action.payload?.items && Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
          state.cartId = action.payload.cartId || state.cartId;
        }
      })

      // ── syncApplyCoupon ─────────────────────────────────────────────────────
      .addCase(syncApplyCoupon.pending, (state) => {
        state.isCouponLoading = true;
        state.couponError = null;
      })
      .addCase(syncApplyCoupon.fulfilled, (state, action) => {
        state.isCouponLoading = false;
        if (action.payload) {
          state.appliedCoupon = {
            code: action.payload.code,
            discountAmount: parseFloat(action.payload.discountAmount) || 0,
            discountPercent: action.payload.discountType === 'PERCENTAGE' ? parseFloat(action.payload.discountValue) : 0,
            discountType: action.payload.discountType || 'PERCENTAGE',
            discountValue: parseFloat(action.payload.discountValue) || 0,
            isApplied: true,
          };
          state.couponSuccess = `Coupon "${action.payload.code}" applied! Saved ₹${action.payload.discountAmount}.`;
          state.couponError = null;
        }
      })
      .addCase(syncApplyCoupon.rejected, (state, action) => {
        state.isCouponLoading = false;
        state.couponError = action.payload || 'Invalid or expired coupon code.';
      });
  },
});

export const {
  hydrateCart,
  addToCart,
  toggleCartItem,
  updateQuantity,
  removeFromCart,
  toggleSelectItem,
  selectAllItems,
  removeSelectedItems,
  applyCouponCode,
  removeCouponCode,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
