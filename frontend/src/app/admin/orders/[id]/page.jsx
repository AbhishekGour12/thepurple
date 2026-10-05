'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Truck,
  Package,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  User,
  MapPin,
  Tag,
  Printer,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import { orderApi } from '@/lib/api/orders';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [notice, setNotice] = useState(null);

  // Refund Action State
  const [refundStatusChoice, setRefundStatusChoice] = useState('PROCESSED');
  const [refundNote, setRefundNote] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  async function loadOrder() {
    try {
      setLoading(true);
      const data = await orderApi.adminGetOrderDetails(orderId);
      setOrder(data);
      setSelectedStatus(data?.status || 'PAYMENT_RECEIVED');
    } catch (err) {
      console.warn('Could not load order details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (selectedStatus === 'CANCELLED') {
      const confirmCancel = window.confirm(
        'Are you sure you want to mark this order as CANCELLED? This will also automatically trigger cancellation on Shiprocket (cancelling order & AWB).'
      );
      if (!confirmCancel) return;
    }
    try {
      setUpdating(true);
      const res = await orderApi.adminUpdateStatus(orderId, { status: selectedStatus, notes: statusNote });
      const srNotice = res?.shiprocketCancellation?.success
        ? ' (Shiprocket shipment voided & cancelled)'
        : '';
      setNotice(`Order status updated to "${selectedStatus}"${srNotice}`);
      setStatusNote('');
      loadOrder();
    } catch (err) {
      alert(err.message || 'Could not update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt(
      'Enter reason for cancelling this order (this will also cancel the order on Shiprocket):',
      'Cancelled by Administrator'
    );
    if (reason === null) return;

    try {
      setUpdating(true);
      const res = await orderApi.adminCancelOrder(orderId, reason || 'Cancelled by Administrator');
      const srNotice = res?.shiprocketCancellation?.success
        ? ' and cancelled on Shiprocket'
        : '';
      setNotice(`Order #${order?.orderNumber || orderId} has been cancelled${srNotice}.`);
      loadOrder();
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateLabel = async () => {
    try {
      setUpdating(true);
      const res = await orderApi.adminGenerateLabel(orderId);
      if (res?.labelUrl) {
        window.open(res.labelUrl, '_blank');
      }
      setNotice(
        `Order Dispatched! Courier: ${res?.courierName || 'Assigned'} (AWB: ${res?.awbCode || 'Assigned'}) | Pickup Scheduled: ${res?.pickupScheduledDate || 'Next Day'}`
      );
      await loadOrder();
    } catch (err) {
      alert(err.message || 'Could not dispatch order in Shiprocket');
    } finally {
      setUpdating(false);
    }
  };

  const handleSchedulePickup = async () => {
    try {
      setUpdating(true);
      const res = await orderApi.adminSchedulePickup(orderId);
      setNotice(`Courier Pickup scheduled successfully${res?.pickupScheduledDate ? ` for ${res.pickupScheduledDate}` : ''}!`);
      await loadOrder();
    } catch (err) {
      alert(err.message || 'Could not schedule pickup in Shiprocket');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      setUpdating(true);
      const res = await orderApi.adminGenerateInvoice(orderId);
      if (res?.invoiceUrl) {
        window.open(res.invoiceUrl, '_blank');
        setNotice('Shiprocket Tax Invoice PDF generated and opened!');
      } else {
        setNotice('Invoice generated successfully!');
      }
      await loadOrder();
    } catch (err) {
      alert(err.message || 'Could not generate invoice in Shiprocket');
    } finally {
      setUpdating(false);
    }
  };

  const handleSyncShiprocket = async () => {
    try {
      setUpdating(true);
      const res = await orderApi.adminSyncShiprocket(orderId);
      setNotice(`Shiprocket live status synced: ${res?.status || 'Updated'}`);
      await loadOrder();
    } catch (err) {
      alert(err.message || 'Could not sync with Shiprocket');
    } finally {
      setUpdating(false);
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await orderApi.adminProcessRefund(orderId, {
        refundStatus: refundStatusChoice,
        refundAmount: order.refundAmount || order.totalAmount,
        notes: refundNote,
      });
      setNotice(`Refund request marked as "${refundStatusChoice}"`);
      setRefundNote('');
      loadOrder();
    } catch (err) {
      alert(err.message || 'Could not process refund');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
        <div style={{ width: '28px', height: '28px', border: '3px solid #7E22CE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <span>Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link href="/admin/orders" style={{ color: '#7E22CE', fontWeight: 700 }}>&larr; Back to Orders</Link>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1320px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Back Button & Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              color: '#4B5563',
              fontSize: '12.5px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            <span>Orders List</span>
          </Link>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E1B4B', margin: 0 }}>
            Order #{order.orderNumber}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              backgroundColor: '#FAF5FF',
              color: '#7E22CE',
              border: '1px solid #E9D5FF',
              fontSize: '12.5px',
              fontWeight: 800,
            }}
          >
            Status: {order.status}
          </span>
          {order.refundStatus === 'REQUESTED' && (
            <span style={{ padding: '5px 12px', borderRadius: '20px', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '12px', fontWeight: 800 }}>
              Refund Requested
            </span>
          )}
        </div>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div style={{ marginBottom: '20px', padding: '14px 18px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', color: '#15803D', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{notice}</span>
        </div>
      )}

      {/* 2-Column Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: ORDER ITEMS & CUSTOMER / SHIPPING DETAILS */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Purchased Items Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
              Purchased Products ({items.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#FAF5FF', border: '1px solid #E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={item.product?.image || (Array.isArray(item.product?.images) && item.product.images[0]?.imageUrl) || '/images/storefront/prod-gold-rope.jpg'}
                      alt={item.productName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E1B4B' }}>{item.productName}</div>
                    <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                      SKU: {item.sku} | Unit Price: ₹{parseFloat(item.price || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Qty: {item.quantity}</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B' }}>
                      ₹{parseFloat(item.totalPrice || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                <span>Subtotal Amount</span>
                <span style={{ fontWeight: 700, color: '#1E1B4B' }}>₹{parseFloat(order.subtotalAmount || 0).toLocaleString('en-IN')}</span>
              </div>

              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 700 }}>
                  <span>Discount Applied ({order.appliedCouponCode || 'PROMO'})</span>
                  <span>- ₹{parseFloat(order.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                <span>Shiprocket Delivery Fee</span>
                <span style={{ fontWeight: 700, color: order.shippingAmount == 0 ? '#16A34A' : '#1E1B4B' }}>
                  {order.shippingAmount == 0 ? 'FREE' : `₹${parseFloat(order.shippingAmount).toLocaleString('en-IN')}`}
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B' }}>Total Collected</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7E22CE' }}>
                  ₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Destination Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
              Customer & Delivery Address
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11.5px', display: 'block' }}>Customer Name</span>
                <strong>{order.customerName}</strong>
              </div>

              <div>
                <span style={{ color: '#6B7280', fontSize: '11.5px', display: 'block' }}>Mobile Number</span>
                <strong>{order.customerMobile}</strong>
              </div>

              <div>
                <span style={{ color: '#6B7280', fontSize: '11.5px', display: 'block' }}>Email Address</span>
                <strong>{order.customerEmail || 'Not provided'}</strong>
              </div>

              <div>
                <span style={{ color: '#6B7280', fontSize: '11.5px', display: 'block' }}>Postal Pincode & City</span>
                <strong>{order.pincode} - {order.city}, {order.state}</strong>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: '#FAF8FC', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '12.5px' }}>
              <span style={{ color: '#6B7280', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Complete Street Address:</span>
              <div style={{ color: '#1E1B4B', marginTop: '2px' }}>{order.shippingAddress}</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SHIPROCKET, PAYMENT, STATUS & REFUND ACTIONS */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Shiprocket Fulfillment Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#7E22CE" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                  Shiprocket Fulfillment
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSyncShiprocket}
                disabled={updating}
                title="Sync Live Tracking & Status from Shiprocket"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  color: '#7E22CE',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: updating ? 'wait' : 'pointer',
                }}
              >
                <RefreshCw size={12} className={updating ? 'spin-icon' : ''} />
                <span>Sync Live</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Shiprocket Order ID:</span>
                <strong>{order.shiprocketOrderId || 'Pending sync'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Courier Assigned:</span>
                <strong style={{ color: order.courierName ? '#1E1B4B' : '#9CA3AF' }}>{order.courierName || 'Pending Courier Selection'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>AWB Code:</span>
                <strong style={{ fontFamily: 'monospace', color: order.awbCode ? '#7E22CE' : '#9CA3AF' }}>
                  {order.awbCode || 'Not Assigned'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Shipping Label:</span>
                <strong style={{ color: order.isLabelGenerated || order.labelUrl ? '#15803D' : '#D97706' }}>
                  {order.isLabelGenerated || order.labelUrl ? 'Generated ✓' : 'Pending Generation'}
                </strong>
              </div>

              {order.pickupScheduledDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Pickup Scheduled:</span>
                  <strong style={{ color: '#2563EB' }}>{order.pickupScheduledDate}</strong>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 1. Assign Courier & Generate AWB / Label */}
              {order.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={handleGenerateLabel}
                  disabled={updating}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    backgroundColor: '#7E22CE',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: updating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(126, 34, 206, 0.25)',
                  }}
                >
                  <FileText size={15} />
                  <span>{updating ? 'Processing...' : order.awbCode ? 'Re-generate Shipping Label' : 'Assign Courier & Generate AWB'}</span>
                </button>
              )}

              {/* 2. Schedule Courier Pickup */}
              {order.awbCode && order.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={handleSchedulePickup}
                  disabled={updating}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: updating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Calendar size={14} />
                  <span>{updating ? 'Scheduling...' : 'Schedule Next Day Courier Pickup'}</span>
                </button>
              )}

              {/* 3. Official Tax Invoice Download */}
              {order.shiprocketOrderId && (
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  disabled={updating}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF5FF',
                    border: '1.5px solid #E9D5FF',
                    color: '#7E22CE',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: updating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={14} />
                  <span>{order.invoiceUrl ? 'Download Tax Invoice (PDF)' : 'Generate Tax Invoice (PDF)'}</span>
                </button>
              )}

              {/* 4. Print Label PDF */}
              {order.labelUrl && (
                <a
                  href={order.labelUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    color: '#374151',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <Printer size={14} />
                  <span>Print Shipping Label (PDF)</span>
                </a>
              )}
            </div>
          </div>

          {/* Update Order Status Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 14px' }}>
              Update Order Status
            </h3>

            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Select Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#FAF8FC',
                  }}
                >
                  <option value="PAYMENT_RECEIVED">PAYMENT_RECEIVED (Confirmed)</option>
                  <option value="PACKING">PACKING (In Warehouse)</option>
                  <option value="SHIPROCKET_PICKUP">SHIPROCKET_PICKUP (Handed to Courier)</option>
                  <option value="IN_TRANSIT">IN_TRANSIT (On the Way)</option>
                  <option value="DELIVERED">DELIVERED (Completed)</option>
                  <option value="CANCELLED">CANCELLED (Void)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Admin Status Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Package packed and sealed"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#1E1B4B',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: updating ? 'wait' : 'pointer',
                  marginTop: '4px',
                }}
              >
                {updating ? 'Updating...' : 'Save Status'}
              </button>
            </form>
          </div>

          {/* Refund Manager Card (If Cancelled or Refund Requested) */}
          {(order.status === 'CANCELLED' || order.refundStatus === 'REQUESTED') && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FCD34D', padding: '22px', backgroundColor: '#FFFDF5', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <RotateCcw size={18} color="#D97706" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400E', margin: 0 }}>
                  Refund Management
                </h3>
              </div>

              <div style={{ fontSize: '12.5px', color: '#78350F', marginBottom: '14px', lineHeight: 1.5 }}>
                <div><strong>Refund Amount:</strong> ₹{parseFloat(order.refundAmount || order.totalAmount || 0).toLocaleString('en-IN')}</div>
                <div><strong>Reason:</strong> {order.refundReason || order.cancellationReason || 'Customer requested cancellation'}</div>
                <div><strong>Current Status:</strong> <span style={{ fontWeight: 800, textTransform: 'uppercase' }}>{order.refundStatus}</span></div>
              </div>

              <form onSubmit={handleProcessRefund} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select
                  value={refundStatusChoice}
                  onChange={(e) => setRefundStatusChoice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #FCD34D',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="PROCESSED">PROCESSED (Refund Issued)</option>
                  <option value="APPROVED">APPROVED (Queued for Processing)</option>
                  <option value="REJECTED">REJECTED (Declined)</option>
                </select>

                <input
                  type="text"
                  placeholder="Refund Transaction Ref / Note"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                  }}
                />

                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    padding: '9px',
                    borderRadius: '8px',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: updating ? 'wait' : 'pointer',
                  }}
                >
                  Update Refund Status
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
