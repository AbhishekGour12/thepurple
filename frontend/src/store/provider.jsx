'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './index';
import { hydrateCustomerFromStorage, restoreCustomerSession } from './slices/authSlice';
import { hydrateCart, fetchCart } from './slices/cartSlice';
import { fetchWishlist, hydrateWishlist } from './slices/wishlistSlice';

function AppBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Instant auth session hydration from localStorage
    dispatch(hydrateCustomerFromStorage());
    // 2. Validate token with backend if exists
    dispatch(restoreCustomerSession());
    // 3. Instant cart hydration from localStorage & sync from database
    dispatch(hydrateCart());
    dispatch(fetchCart());
    // 4. Instant wishlist hydration from localStorage & sync from database
    dispatch(hydrateWishlist());
    dispatch(fetchWishlist());
  }, [dispatch]);

  return children;
}

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <AppBootstrap>
        {children}
      </AppBootstrap>
      <ToastContainer
        position="top-right"
        autoClose={4200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </Provider>
  );
}
