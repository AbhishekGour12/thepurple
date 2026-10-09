'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  XCircle,
  MapPin,
  CreditCard,
  Printer,
  ShoppingBag,
  Headphones,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import { orderApi } from '@/lib/api/orders';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState(null);

  // Cancellation Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  async function loadOrderDetails() {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getOrderDetails(orderId);
      setOrder(data);
    } catch (err) {
      console.warn('Could not load order details:', err);
      setError(err.message || 'Order not found or access restricted.');
    } finally {
      setLoading(false);
    }
  }

  const handleSyncShiprocket = async () => {
    if (!order?.id) return;
    try {
      setSyncing(true);
      const res = await orderApi.syncShiprocketStatus(order.id);
      setNotice('Live Shiprocket tracking synced successfully!');
      if (res.order) {
        setOrder((prev) => ({ ...prev, ...res.order, liveTracking: res.liveTracking }));
      } else {
        await loadOrderDetails();
      }
    } catch (err) {
      alert(err.message || 'Could not sync live tracking');
    } finally {
      setSyncing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order?.id) return;
    try {
      setCancelLoading(true);
      await orderApi.cancelOrder(order.id, cancelReason || 'Cancelled by customer');
      setNotice('Order cancelled successfully. Refund request created.');
      setIsCancelModalOpen(false);
      await loadOrderDetails();
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    } finally {
      setCancelLoading(false);
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
        return { label: status || 'Pending', bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' };
    }
  };

  const trackingSteps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', done: Boolean(order?.status) },
    { key: 'PACKING', label: 'Warehouse Packing', done: ['PACKING', 'SHIPROCKET_PICKUP', 'IN_TRANSIT', 'DELIVERED'].includes(order?.status) },
    { key: 'DISPATCHED', label: 'Handed to Courier', done: ['SHIPROCKET_PICKUP', 'IN_TRANSIT', 'DELIVERED'].includes(order?.status) || Boolean(order?.awbCode) },
    { key: 'IN_TRANSIT', label: 'In Transit', done: ['IN_TRANSIT', 'DELIVERED'].includes(order?.status) },
    { key: 'DELIVERED', label: 'Delivered', done: order?.status === 'DELIVERED' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FCFBFE', color: '#1E1B4B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <AnnouncementBar />
        <MainHeader />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #7E22CE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
            <div style={{ fontSize: '15px', color: '#6B7280', fontWeight: 600 }}>Loading order details...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FCFBFE', color: '#1E1B4B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <AnnouncementBar />
        <MainHeader />
        <main style={{ flex: 1, maxWidth: '640px', margin: '0 auto', width: '100%', padding: '60px 20px 100px', boxSizing: 'border-box', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '40px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px' }}>Order Not Found</h2>
            <p style={{ color: '#6B7280', fontSize: '13.5px', marginBottom: '24px', lineHeight: 1.5 }}>
              {error || 'We could not locate this order. Please verify your order number or check your My Orders list.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/my-orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#7E22CE', color: '#FFFFFF', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                <ArrowLeft size={14} />
                <span>Go to My Orders</span>
              </Link>
              <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                <ShoppingBag size={14} />
                <span>Shop Jewellery</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusBadge = getStatusBadge(order.status);
  const items = order.items || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FCFBFE', color: '#1E1B4B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AnnouncementBar />
      <MainHeader />

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '28px 20px 80px', boxSizing: 'border-box', flex: 1 }}>
        
        {/* Top Breadcrumb & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            href="/my-orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#7E22CE',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to All Orders</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: '#374151',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Printer size={13} />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Notice Alert */}
        {notice && (
          <div style={{ marginBottom: '20px', padding: '14px 18px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: 700 }}>
            <CheckCircle2 size={18} />
            <span>{notice}</span>
          </div>
        )}

        {/* Order Header Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)', fontWeight: 900, color: '#1E1B4B', margin: 0 }}>
                  Order #{order.orderNumber}
                </h1>
                <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: statusBadge.bg, color: statusBadge.color, border: `1px solid ${statusBadge.border}`, fontSize: '12px', fontWeight: 800 }}>
                  {statusBadge.label}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Total Amount Paid</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7E22CE', marginTop: '2px' }}>
                ₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Shipment Tracking Progress Bar */}
          {order.status !== 'CANCELLED' && (
            <div style={{ paddingTop: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E1B4B', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Delivery Status Progress</span>
                <span style={{ fontSize: '12px', color: '#6D28D9' }}>{order.courierName ? `Via ${order.courierName}` : 'Express Shipping'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${trackingSteps.length}, 1fr)`, gap: '8px', position: 'relative' }}>
                {trackingSteps.map((step, idx) => (
                  <div key={step.key} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        height: '6px',
                        borderRadius: '4px',
                        backgroundColor: step.done ? '#7E22CE' : '#E5E7EB',
                        marginBottom: '8px',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                    <div style={{ fontSize: '11.5px', fontWeight: step.done ? 800 : 500, color: step.done ? '#1E1B4B' : '#9CA3AF' }}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Grid: Left Items + Right Summary & Tracking */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} color="#7E22CE" />
                <span>Items in this Order ({items.length})</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: '#FAF5FF', border: '1px solid #E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={item.product?.image || (Array.isArray(item.product?.images) && item.product.images[0]?.imageUrl) || '/images/storefront/prod-gold-rope.jpg'}
                        alt={item.productName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B', marginBottom: '2px' }}>{item.productName}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        Qty: {item.quantity} × ₹{parseFloat(item.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#1E1B4B', flexShrink: 0 }}>
                      ₹{parseFloat(item.totalPrice || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#7E22CE" />
                <span>Shipping & Delivery Details</span>
              </h3>

              <div style={{ fontSize: '13.5px', color: '#374151', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 800, color: '#1E1B4B' }}>{order.customerName}</div>
                <div>{order.shippingAddress}</div>
                {order.landmark && <div>Landmark: {order.landmark}</div>}
                <div>{order.city}, {order.state} - <strong>{order.pincode}</strong></div>
                <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#6B7280' }}>
                  Mobile: <strong>+91 {order.customerMobile}</strong> {order.customerEmail ? `• Email: ${order.customerEmail}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Shiprocket Tracking & Payment Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Live Shiprocket Tracking Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="#7E22CE" />
                  <span>Shiprocket Live Tracking</span>
                </h3>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 800 }}>
                  Live API
                </span>
              </div>

              <div style={{ backgroundColor: '#FAF8FC', padding: '16px', borderRadius: '14px', border: '1px solid #E9D5FF', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <div style={{ color: '#6B7280', fontWeight: 700 }}>Courier Partner</div>
                    <div style={{ fontWeight: 800, color: '#1E1B4B', marginTop: '2px' }}>{order.courierName || 'Shiprocket Express'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6B7280', fontWeight: 700 }}>AWB Number</div>
                    <div style={{ fontWeight: 800, color: '#7E22CE', marginTop: '2px', fontFamily: 'monospace' }}>{order.awbCode || 'Assigned on Dispatch'}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(order.awbCode || order.shipment?.awbCode) && (
                  <a
                    href={`https://shiprocket.co/tracking/${order.awbCode || order.shipment?.awbCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#7E22CE',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Live Tracking Portal</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleSyncShiprocket}
                  disabled={syncing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    color: '#7E22CE',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} className={syncing ? 'spin-anim' : ''} />
                  <span>{syncing ? 'Syncing...' : 'Sync Live'}</span>
                </button>
              </div>

              {/* Order Cancellation Option */}
              {order.canCancel && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <XCircle size={14} />
                    <span>Cancel This Order</span>
                  </button>
                </div>
              )}
            </div>

            {/* Payment & Charges Summary */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#7E22CE" />
                <span>Payment Summary</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                  <span>Items Subtotal:</span>
                  <span style={{ fontWeight: 700, color: '#1E1B4B' }}>₹{parseFloat(order.subtotalAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                {parseFloat(order.discountAmount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D' }}>
                    <span>Coupon Discount {order.appliedCouponCode ? `(${order.appliedCouponCode})` : ''}:</span>
                    <span style={{ fontWeight: 700 }}>-₹{parseFloat(order.discountAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                  <span>Shipping Fee (Shiprocket):</span>
                  <span style={{ fontWeight: 700, color: '#1E1B4B' }}>₹{parseFloat(order.shippingAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '6px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, color: '#1E1B4B' }}>
                  <span>Total Paid:</span>
                  <span style={{ color: '#7E22CE' }}>₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} color="#16A34A" />
                  <span>Paid securely via Razorpay ({order.paymentStatus || 'PAID'})</span>
                </div>
              </div>
            </div>

            {/* Need Help CTA */}
            <div style={{ backgroundColor: '#FAF5FF', borderRadius: '18px', border: '1px solid #E9D5FF', padding: '20px', textAlign: 'center' }}>
              <Headphones size={24} color="#7E22CE" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#581C87' }}>Need Help with this Order?</div>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 12px' }}>Our customer assistance team is available 24x7 to assist you.</p>
              <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#7E22CE', color: '#FFFFFF', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                <span>Contact Customer Care</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Cancellation Modal */}
        {isCancelModalOpen && (
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
            }}
          >
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '28px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 8px' }}>
                Cancel Order #{order.orderNumber}?
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5 }}>
                Cancellation is eligible since your order has not been dispatched yet. A refund of <strong>₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}</strong> will be initiated.
              </p>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Reason for cancellation:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Changed mind / Need to update address"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', boxSizing: 'border-box', marginBottom: '20px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={cancelLoading}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: cancelLoading ? 'wait' : 'pointer' }}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
