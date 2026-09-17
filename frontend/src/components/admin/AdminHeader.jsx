"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { LogOut, KeyRound, User, Bell, ShoppingBag, Check, X, ArrowRight } from 'lucide-react';
import { logoutAdminUser } from '@/store/slices/authSlice';
import { orderApi } from '@/lib/api/orders';
import Link from 'next/link';

// Play gentle web audio chime on new order
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio context may be restricted by browser policy before first interaction
  }
}

export default function AdminHeader({ admin }) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [latestToast, setLatestToast] = useState(null);
  const knownOrderIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Poll for new orders every 10 seconds
  useEffect(() => {
    let isSubscribed = true;

    async function checkForNewOrders() {
      try {
        const data = await orderApi.adminGetOrders({ limit: 6 });
        const orders = data?.orders || [];

        if (!isSubscribed) return;

        if (isFirstLoadRef.current) {
          // Initialize known orders on first load
          orders.forEach((o) => knownOrderIdsRef.current.add(o.id));
          isFirstLoadRef.current = false;
          return;
        }

        // Check for brand new orders
        const newOrders = orders.filter((o) => !knownOrderIdsRef.current.has(o.id));
        if (newOrders.length > 0) {
          newOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));

          // Create notification entries
          const newNotifs = newOrders.map((o) => ({
            id: `notif-${o.id}-${Date.now()}`,
            orderId: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            amount: o.totalAmount,
            time: 'Just now',
            isRead: false,
          }));

          setNotifications((prev) => [...newNotifs, ...prev].slice(0, 15));
          setUnreadCount((prev) => prev + newOrders.length);

          // Trigger audio chime
          playNotificationChime();

          // Show floating live Toast
          const firstNew = newOrders[0];
          setLatestToast({
            orderNumber: firstNew.orderNumber,
            customerName: firstNew.customerName,
            amount: firstNew.totalAmount,
            id: firstNew.id,
          });

          // Auto-hide toast after 6 seconds
          setTimeout(() => {
            setLatestToast(null);
          }, 6000);
        }
      } catch {
        // Silently continue polling
      }
    }

    checkForNewOrders();
    const interval = setInterval(checkForNewOrders, 10000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutAdminUser());
    router.replace('/admin/login');
  };

  const handleOpenDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    if (!isDropdownOpen) {
      setUnreadCount(0);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { bg: '#FAF5FF', text: '#6B21A8', border: '#D8B4FE', label: 'Super Admin' };
      case 'MANAGER':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Manager' };
      case 'EXECUTIVE':
      case 'WORKER':
        return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', label: 'Executive' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', label: role || 'Admin' };
    }
  };

  const badge = getRoleBadgeStyle(admin?.role);

  return (
    <>
      {/* Floating Real-Time Order Toast Alert */}
      {latestToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#1E1B4B',
            color: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            border: '1.5px solid #7E22CE',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '380px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#7E22CE',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShoppingBag size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#F3E8FF' }}>
              🎉 New Order Received!
            </div>
            <div style={{ fontSize: '12px', color: '#DDD6FE', marginTop: '2px' }}>
              <strong>#{latestToast.orderNumber}</strong> • {latestToast.customerName} (₹{parseFloat(latestToast.amount || 0).toLocaleString('en-IN')})
            </div>
          </div>

          <Link
            href={`/admin/orders/${latestToast.id}`}
            onClick={() => setLatestToast(null)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#7E22CE',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>View</span>
            <ArrowRight size={12} />
          </Link>

          <button
            type="button"
            onClick={() => setLatestToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#A5B4FC',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <header
        style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #E9D5FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        {/* System Status / Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#6B7280',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981',
              }}
            />
            <span>ThePurple Live System</span>
          </div>
        </div>

        {/* Admin Profile & Live Notification Center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          {/* Live Notification Bell Icon */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={handleOpenDropdown}
              aria-label="Order Notifications"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isDropdownOpen ? '#FAF5FF' : '#F9FAFB',
                border: `1px solid ${isDropdownOpen ? '#7E22CE' : '#E5E7EB'}`,
                color: isDropdownOpen ? '#7E22CE' : '#4B5563',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 900,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '340px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  border: '1px solid #E9D5FF',
                  padding: '12px 0',
                  zIndex: 100,
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                <div
                  style={{
                    padding: '0 16px 10px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E1B4B' }}>
                    Live Order Notifications
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#15803D',
                      backgroundColor: '#DCFCE7',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }}
                  >
                    Active
                  </span>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280', fontSize: '12.5px' }}>
                      <ShoppingBag size={24} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
                      <div>No new order notifications right now.</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>New orders will pop up here live!</div>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={`/admin/orders/${n.orderId}`}
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 16px',
                          textDecoration: 'none',
                          borderBottom: '1px solid #FAF5FF',
                          backgroundColor: '#FFFFFF',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#FAF5FF',
                            border: '1px solid #E9D5FF',
                            color: '#7E22CE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <ShoppingBag size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E1B4B' }}>
                            Order #{n.orderNumber}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                            {n.customerName} • ₹{parseFloat(n.amount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <span style={{ fontSize: '10.5px', color: '#9CA3AF', flexShrink: 0 }}>
                          {n.time}
                        </span>
                      </Link>
                    ))
                  )}
                </div>

                <div style={{ padding: '8px 16px 0', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsDropdownOpen(false)}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#7E22CE',
                      textDecoration: 'none',
                    }}
                  >
                    View All Orders &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Role Badge */}
          <span
            style={{
              backgroundColor: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.03em',
            }}
          >
            {badge.label}
          </span>

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7E22CE',
              }}
            >
              <User size={18} />
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E1B4B' }}>
                {admin?.name || 'Admin'}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {admin?.email}
              </div>
            </div>
          </div>

          {/* Change Password Link */}
          <Link
            href="/admin/change-password"
            title="Change Password"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              color: '#6B7280',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <KeyRound size={16} />
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#DC2626',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </header>
    </>
  );
}
