"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAdmin, logoutAdminUser } from '@/store/slices/authSlice';
import { getStoredAdminToken, getStoredAdmin, observeSession } from '@/lib/auth/session';
import { adminAuthApi } from '@/lib/api/admin/auth';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import './admin.css';

function isRouteAllowedForRole(pathname, role) {
  if (!role || role === 'SUPER_ADMIN') return true;

  // Manager: CANNOT access new/bulk product creation, banners, coupons, admins, settings
  if (role === 'MANAGER') {
    if (pathname.startsWith('/admin/products/new')) return false;
    if (pathname.startsWith('/admin/products/bulk')) return false;
    if (pathname.startsWith('/admin/banners')) return false;
    if (pathname.startsWith('/admin/coupons')) return false;
    if (pathname.startsWith('/admin/admins')) return false;
    if (pathname.startsWith('/admin/settings')) return false;
    return true;
  }

  // Executive / Worker: CANNOT access users, banners, contacts, coupons, admins, settings
  if (role === 'EXECUTIVE' || role === 'WORKER') {
    if (pathname.startsWith('/admin/users')) return false;
    if (pathname.startsWith('/admin/banners')) return false;
    if (pathname.startsWith('/admin/contacts')) return false;
    if (pathname.startsWith('/admin/coupons')) return false;
    if (pathname.startsWith('/admin/admins')) return false;
    if (pathname.startsWith('/admin/settings')) return false;
    return true;
  }

  return true;
}

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

  const role = adminProfile?.role || 'EXECUTIVE';
  const isAllowed = isRouteAllowedForRole(pathname, role);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FDFBF7' }}>
      <AdminSidebar
        role={role}
        mustChangePassword={adminProfile?.mustChangePassword}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader admin={adminProfile} />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {isAllowed ? (
            children
          ) : (
            <div style={{
              maxWidth: '560px',
              margin: '60px auto',
              padding: '36px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(107, 33, 168, 0.08)',
              border: '1px solid #F3E8FF',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <ShieldAlert size={32} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px' }}>
                Access Restricted
              </h2>
              <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                Your current administrative role (<strong>{role}</strong>) does not have authorization to view or manage this section.
              </p>
              <Link
                href="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
