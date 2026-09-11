"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAdmin, logoutAdminUser } from '@/store/slices/authSlice';
import { getStoredAdminToken, getStoredAdmin, observeSession } from '@/lib/auth/session';
import { adminAuthApi } from '@/lib/api/admin/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import './admin.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const adminProfile = useSelector((state) => state.auth?.admin?.profile);
  const [ready, setReady] = useState(false);

  // Public unauthenticated admin auth paths
  const isAuthPath =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  useEffect(() => {
    if (isAuthPath) {
      setReady(true);
      return undefined;
    }

    const token = getStoredAdminToken();
    const storedAdmin = getStoredAdmin();

    if (!token) {
      router.replace('/admin/login');
      return undefined;
    }

    // Initialize with stored state immediately
    if (storedAdmin) {
      dispatch(setAdmin({ token, profile: storedAdmin }));
      setReady(true);
    }

    // Verify token validity with backend
    adminAuthApi
      .me()
      .then((data) => {
        if (data?.admin) {
          dispatch(setAdmin({ token, profile: data.admin }));
          setReady(true);
        } else {
          dispatch(logoutAdminUser());
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        dispatch(logoutAdminUser());
        router.replace('/admin/login');
      });

    const unsubscribe = observeSession((session) => {
      if (!session && !isAuthPath) {
        router.replace('/admin/login');
      }
    });

    return unsubscribe;
  }, [pathname, isAuthPath, router, dispatch]);

  if (isAuthPath) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAF5FF',
        fontFamily: 'var(--font-heading)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E9D5FF',
          borderTopColor: '#7E22CE',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ marginTop: '16px', color: '#6B21A8', fontWeight: 600, fontSize: '14px' }}>
          Verifying ThePurple administrator session...
        </p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FDFBF7' }}>
      <AdminSidebar
        role={adminProfile?.role || 'EXECUTIVE'}
        mustChangePassword={adminProfile?.mustChangePassword}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader admin={adminProfile} />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
