'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  Package,
  Truck,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Search,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import { orderApi } from '@/lib/api/orders';

export default function MyOrdersPage() {
  const router = useRouter();
  const customerUser = useSelector((state) => state.auth?.customer?.user);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [customerUser?.id, customerUser?.email, customerUser?.mobile]);

  async function loadOrders(overrideQuery = '') {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      const q = (overrideQuery !== undefined && overrideQuery !== '' ? overrideQuery : searchQuery).trim();
      if (q) {
        if (q.includes('@')) {
          params.email = q;
        } else if (/^\d{10}$/.test(q)) {
          params.mobile = q;
        } else {
          params.orderNumber = q;
        }
      } else {
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('thepurple_customer_email') : null;
        const storedMobile = typeof window !== 'undefined' ? localStorage.getItem('thepurple_customer_mobile') : null;
        const storedOrders = typeof window !== 'undefined' ? localStorage.getItem('thepurple_recent_orders') : null;

        if (customerUser?.email) {
          params.email = customerUser.email;
        } else if (storedEmail) {
          params.email = storedEmail;
        }

        if (customerUser?.mobile) {
          params.mobile = customerUser.mobile;
        } else if (storedMobile) {
          params.mobile = storedMobile;
        }

        if (storedOrders) {
          params.orderIds = storedOrders;
        }
      }

      const data = await orderApi.getMyOrders(params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load customer orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    loadOrders(searchQuery);
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    try {
      setCancelLoading(true);
      await orderApi.cancelOrder(cancellingOrder.id, cancelReason || 'Cancelled by customer');
      setNotice('Order cancelled successfully. Refund request has been sent to our team.');
      setCancellingOrder(null);
      setCancelReason('');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const [syncingOrderId, setSyncingOrderId] = useState(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const handleOpenTracking = async (order) => {
    setTrackingModalOrder(order);
    setTrackingData(order.shipment?.lastTrackingUpdate || null);
    if (order.awbCode) {
      try {
        setTrackingLoading(true);
        const res = await orderApi.syncShiprocketStatus(order.id);
        if (res.liveTracking) {
          setTrackingData(res.liveTracking);
        }
      } catch (err) {
        console.warn('Could not fetch tracking:', err);
      } finally {
        setTrackingLoading(false);
      }
    }
  };

  const handleSyncStatus = async (orderId) => {
    try {
      setSyncingOrderId(orderId);
      const res = await orderApi.syncShiprocketStatus(orderId);
      setNotice('Live Shiprocket courier status updated!');
      if (trackingModalOrder && trackingModalOrder.id === orderId && res.liveTracking) {
        setTrackingData(res.liveTracking);
      }
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Could not sync Shiprocket status');
    } finally {
      setSyncingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ORDER_CREATED':
      case 'PAYMENT_RECEIVED':
        return { label: 'Order Confirmed', bg: '#FAF5FF', color: '#7E22CE', border: '#E9D5FF' };
      case 'PACKING':
        return { label: 'Packing at Warehouse', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      case 'SHIPROCKET_PICKUP':
        return { label: 'Handed to Courier', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' };
      case 'IN_TRANSIT':
        return { label: 'In Transit', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
      case 'DELIVERED':
        return { label: 'Delivered ✓', bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
      default:
        return { label: status, bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FCFBFE', color: '#1E1B4B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AnnouncementBar />
      <MainHeader />

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '24px 20px 80px', boxSizing: 'border-box', flex: 1 }}>
        
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.85rem)', fontWeight: 900, color: '#1E1B4B', margin: '0 0 4px' }}>
              My Orders & Shipments
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Track real-time courier updates, view invoices, or manage your purchases.
            </p>
          </div>

          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              fontSize: '12.5px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Notice Toast */}
        {notice && (
          <div style={{ marginBottom: '20px', padding: '14px 18px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: 700 }}>
            <CheckCircle2 size={18} />
            <span>{notice}</span>
          </div>
        )}

        {/* Cancellation Rule Info Banner */}
        <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', fontSize: '12px', color: '#581C87', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={16} color="#7E22CE" flexShrink={0} />
          <span>
            <strong>Cancellation Policy:</strong> Orders can be cancelled instantly before the shipping label is generated by our warehouse. Once dispatched, cancellation is disabled.
          </span>
        </div>

        {/* Quick Order Lookup Form */}
        <div style={{ marginBottom: '24px', backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Find orders by Mobile Number, Email, or Order # (e.g. TP-47383414)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '10px',
                  border: '1.5px solid #E5E7EB',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '11px 22px',
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Search size={14} />
              <span>Search Orders</span>
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadOrders('');
                }}
                style={{
                  padding: '11px 16px',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #7E22CE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>Loading your orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <Package size={48} color="#7E22CE" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '6px' }}>No orders found</h2>
            <p style={{ color: '#6B7280', fontSize: '13.5px', marginBottom: '20px' }}>You haven't placed any orders yet. Discover our latest jewellery arrivals!</p>
            <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#7E22CE', color: '#FFFFFF', borderRadius: '10px', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>
              <span>Explore Jewellery</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              const items = order.items || [];

              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Order Card Header */}
                  <div
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#FAF8FC',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Order Number</div>
                        <div style={{ fontSize: '14.5px', fontWeight: 900, color: '#1E1B4B' }}>{order.orderNumber}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Placed On</div>
                        <div style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Total Amount</div>
                        <div style={{ fontSize: '14.5px', fontWeight: 900, color: '#7E22CE' }}>
                          ₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items & Shipment Row */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                      {items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#FAF5FF', border: '1px solid #E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
                            <img
                              src={item.product?.image || (Array.isArray(item.product?.images) && item.product.images[0]?.imageUrl) || '/images/storefront/prod-gold-rope.jpg'}
                              alt={item.productName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E1B4B' }}>{item.productName}</div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>
                              Qty: {item.quantity} × ₹{parseFloat(item.price || 0).toLocaleString('en-IN')}
                            </div>
                          </div>

                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B', flexShrink: 0 }}>
                            ₹{parseFloat(item.totalPrice || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address & Action Bar */}
                    <div
                      style={{
                        paddingTop: '16px',
                        borderTop: '1px solid #F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', color: '#4B5563', maxWidth: '480px' }}>
                        <div>
                          <strong style={{ color: '#1E1B4B' }}>Deliver to:</strong> {order.customerName} | {order.shippingAddress}, {order.city} - {order.pincode}
                        </div>
                        {order.courierName && (
                          <div style={{ fontSize: '11.5px', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span><strong>Courier:</strong> {order.courierName}</span>
                            {order.awbCode && <span>| <strong>AWB:</strong> {order.awbCode}</span>}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Live Sync Status Button */}
                        {order.awbCode && (
                          <button
                            type="button"
                            onClick={() => handleSyncStatus(order.id)}
                            disabled={syncingOrderId === order.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              backgroundColor: '#F5F3FF',
                              border: '1px solid #DDD6FE',
                              color: '#6D28D9',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <RefreshCw size={13} className={syncingOrderId === order.id ? 'spin-anim' : ''} />
                            <span>{syncingOrderId === order.id ? 'Syncing...' : 'Sync Live Status'}</span>
                          </button>
                        )}

                        {/* View Order Details Page */}
                        <Link
                          href={`/my-orders/${order.orderNumber || order.id}`}
                          prefetch={true}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            color: '#374151',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          <Package size={14} />
                          <span>View Details</span>
                        </Link>

                        {/* Live Tracking Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenTracking(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            backgroundColor: '#FAF5FF',
                            border: '1px solid #E9D5FF',
                            color: '#7E22CE',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Truck size={14} />
                          <span>Live Tracking</span>
                        </button>

                        {/* Cancel Order Button */}
                        {order.canCancel && (
                          <button
                            type="button"
                            onClick={() => setCancellingOrder(order)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <XCircle size={14} />
                            <span>Cancel Order</span>
                          </button>
                        )}

                        {/* Refund Status Pill if cancelled */}
                        {order.status === 'CANCELLED' && (
                          <div style={{ fontSize: '11.5px', fontWeight: 800, color: order.refundStatus === 'PROCESSED' ? '#15803D' : '#D97706', backgroundColor: order.refundStatus === 'PROCESSED' ? '#DCFCE7' : '#FEF3C7', padding: '4px 10px', borderRadius: '6px' }}>
                            Refund: {order.refundStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation Modal */}
        {cancellingOrder && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '28px',
                maxWidth: '460px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 8px' }}>
                Cancel Order #{cancellingOrder.orderNumber}?
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5 }}>
                Are you sure you want to cancel this order? Since the order has not been dispatched yet, cancellation is free and a refund request for <strong>₹{parseFloat(cancellingOrder.totalAmount || 0).toLocaleString('en-IN')}</strong> will be created.
              </p>

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Reason for cancellation (optional):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Changed my mind / Ordered wrong item"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  marginBottom: '20px',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  disabled={cancelLoading}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: cancelLoading ? 'wait' : 'pointer',
                  }}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Shiprocket Tracking Modal */}
        {trackingModalOrder && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px',
              boxSizing: 'border-box',
            }}
            onClick={() => setTrackingModalOrder(null)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxSizing: 'border-box',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                      Live Shipment Tracking
                    </h3>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 800 }}>
                      Shiprocket Live
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '3px' }}>
                    Order #{trackingModalOrder.orderNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B',
                  }}
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Courier & Status Summary */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Courier Partner</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    {trackingModalOrder.courierName || 'Shiprocket Express'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>AWB Number</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', marginTop: '2px', fontFamily: 'monospace' }}>
                    {trackingModalOrder.awbCode || 'Pending Dispatch'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Current Status</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#7E22CE', marginTop: '2px' }}>
                    {trackingData?.currentStatus || trackingModalOrder.status}
                  </div>
                </div>
              </div>

              {/* Action Link & Poll Button */}
              {trackingModalOrder.awbCode && (
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href={`https://shiprocket.co/tracking/${trackingModalOrder.awbCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#7E22CE',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Live Courier Tracking</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleSyncStatus(trackingModalOrder.id)}
                    disabled={syncingOrderId === trackingModalOrder.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#FAF5FF',
                      border: '1px solid #E9D5FF',
                      color: '#7E22CE',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={14} className={syncingOrderId === trackingModalOrder.id ? 'spin-anim' : ''} />
                    <span>{syncingOrderId === trackingModalOrder.id ? 'Syncing...' : 'Sync Live'}</span>
                  </button>
                </div>
              )}

              {/* Milestones & Activities */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>
                  Courier Tracking Milestones
                </h4>
                {trackingLoading ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>
                    <div style={{ width: '24px', height: '24px', border: '2px solid #7E22CE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                    Querying Shiprocket live courier API...
                  </div>
                ) : trackingData?.activities && trackingData.activities.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid #E2E8F0', marginLeft: '6px' }}>
                    {trackingData.activities.map((act, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: i === 0 ? '#16A34A' : '#94A3B8', border: '2px solid #FFFFFF' }} />
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{act.activity || act.status}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          {act.location ? `${act.location} • ` : ''}{act.date || act['activity-date']}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '12.5px', textAlign: 'center' }}>
                    {trackingModalOrder.status === 'PACKING' || trackingModalOrder.status === 'PAYMENT_RECEIVED'
                      ? 'Your order is currently being packed and verified at our warehouse. Live tracking will activate as soon as the courier scans the parcel.'
                      : 'Live tracking details are updating from the courier network.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
