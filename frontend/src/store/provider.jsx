'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './index';
import { fetchWishlist, hydrateWishlist } from './slices/wishlistSlice';

function WishlistBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Instant client hydration from localStorage cache
    dispatch(hydrateWishlist());
    // 2. Fetch latest saved state from DB
    dispatch(fetchWishlist());
  }, [dispatch]);

  return children;
}

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <WishlistBootstrap>
        {children}
      </WishlistBootstrap>
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
