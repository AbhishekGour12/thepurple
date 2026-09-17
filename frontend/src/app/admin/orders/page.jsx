'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  XCircle,
  Download,
} from 'lucide-react';
import { orderApi } from '@/lib/api/orders';
import { exportToCSV } from '@/lib/utils/exportToExcel';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'PAYMENT_RECEIVED', label: 'Confirmed' },
  { key: 'PACKING', label: 'Packing' },
  { key: 'SHIPROCKET_PICKUP', label: 'Handed to Courier' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'REFUND_REQUESTED', label: 'Refund Requests' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  const [syncingOrderId, setSyncingOrderId] = useState(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => {
      loadData(false); // Silent background poll - no screen flashing or full reload
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, search]);

  async function loadData(showSpinner = false) {
    try {
      if (showSpinner) setLoading(true);
      const query = {};
      if (activeTab === 'REFUND_REQUESTED') {
        query.refundStatus = 'REQUESTED';
      } else if (activeTab !== 'ALL') {
        query.status = activeTab;
      }
      if (search.trim()) {
        query.search = search.trim();
      }

      const [ordersRes, statsRes] = await Promise.all([
        orderApi.adminGetOrders(query),
        orderApi.adminGetStats().catch(() => null),
      ]);

      setOrders(ordersRes?.orders || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.warn('Could not load admin orders:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(true);
  };

  const handleOpenTrackingModal = async (order) => {
    setTrackingModalOrder(order);
    setTrackingData(order.shipment?.lastTrackingUpdate || null);
    if (order.awbCode) {
      try {
        setTrackingLoading(true);
        const res = await orderApi.adminSyncShiprocket(order.id);
        if (res.liveTracking) {
          setTrackingData(res.liveTracking);
        }
        loadData(false);
      } catch (err) {
        console.warn('Could not fetch live tracking:', err);
      } finally {
        setTrackingLoading(false);
      }
    }
  };

  const handleSyncShiprocket = async (orderId) => {
    try {
      setSyncingOrderId(orderId);
      const res = await orderApi.adminSyncShiprocket(orderId);
      setActionNotice(`Shiprocket status synced: "${res.status || 'Updated'}"`);
      if (trackingModalOrder && trackingModalOrder.id === orderId && res.liveTracking) {
        setTrackingData(res.liveTracking);
      }
      await loadData(false);
    } catch (err) {
      alert(err.message || 'Could not sync Shiprocket status');
    } finally {
      setSyncingOrderId(null);
    }
  };

  const handleQuickLabelGenerate = async (orderId) => {
    try {
      setActionNotice('Generating Shiprocket Label & assigning AWB...');
      const res = await orderApi.adminGenerateLabel(orderId);
      setActionNotice(`Label generated! AWB Code: ${res.awbCode || 'Assigned'}`);
      loadData(false);
    } catch (err) {
      alert(err.message || 'Could not generate label');
      setActionNotice(null);
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'ORDER_CREATED':
      case 'PAYMENT_RECEIVED':
        return { label: 'Confirmed', bg: '#FAF5FF', color: '#7E22CE', border: '#E9D5FF' };
      case 'PACKING':
        return { label: 'Packing', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      case 'SHIPROCKET_PICKUP':
        return { label: 'Shipped (Pickup)', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' };
      case 'IN_TRANSIT':
        return { label: 'In Transit', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
      case 'DELIVERED':
        return { label: 'Delivered', bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
      default:
        return { label: status, bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' };
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E1B4B', margin: '0 0 4px' }}>
            Orders & Shiprocket Shipments
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Manage customer orders, generate shipping labels, track courier progress, and approve refund requests.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#15803D', backgroundColor: '#DCFCE7', padding: '5px 10px', borderRadius: '20px', fontWeight: 700, border: '1px solid #BBF7D0' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
            Live Polling (10s)
          </span>

          <button
            type="button"
            onClick={loadData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!orders || orders.length === 0) {
                alert('No orders available to export for the current filter.');
                return;
              }
              const exportRows = orders.map((o) => ({
                orderNumber: o.orderNumber,
                customerName: o.customerName,
                customerMobile: o.customerMobile,
                customerEmail: o.customerEmail || 'N/A',
                status: o.status,
                totalAmount: parseFloat(o.totalAmount || 0),
                paymentMethod: o.paymentMethod,
                paymentStatus: o.paymentStatus,
                city: o.city,
                state: o.state,
                pincode: o.pincode,
                awbCode: o.awbCode || 'N/A',
                createdAt: o.createdAt,
              }));
              exportToCSV(exportRows, `ThePurple-Orders-${activeTab}`, {
                orderNumber: 'Order Number',
                customerName: 'Customer Name',
                customerMobile: 'Mobile',
                customerEmail: 'Email',
                status: 'Order Status',
                totalAmount: 'Total Amount (INR)',
                paymentMethod: 'Payment Method',
                paymentStatus: 'Payment Status',
                city: 'City',
                state: 'State',
                pincode: 'Pincode',
                awbCode: 'Shiprocket AWB',
                createdAt: 'Order Date',
              });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Download size={14} />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', color: '#15803D', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Orders</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#1E1B4B', marginTop: '4px' }}>{stats.totalOrders}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>Packing</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#1D4ED8', marginTop: '4px' }}>{stats.packingOrders}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>Dispatched (Pickup)</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803D', marginTop: '4px' }}>{stats.pickupOrders + stats.inTransitOrders}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Cancelled</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#B91C1C', marginTop: '4px' }}>{stats.cancelledOrders}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Refund Requests</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>{stats.refundRequests}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7E22CE', textTransform: 'uppercase' }}>Total Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#7E22CE', marginTop: '4px' }}>
              ₹{parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '4px' }}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #7E22CE' : '1px solid #E5E7EB',
                  backgroundColor: isActive ? '#7E22CE' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search order #, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '12.5px',
              outline: 'none',
              width: '240px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8FC', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 18px' }}>Order #</th>
                <th style={{ padding: '14px 18px' }}>Customer & Destination</th>
                <th style={{ padding: '14px 18px' }}>Date</th>
                <th style={{ padding: '14px 18px' }}>Amount</th>
                <th style={{ padding: '14px 18px' }}>Payment</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Shiprocket / AWB</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusPill = getStatusPill(order.status);
                  const isPaid = order.paymentStatus === 'PAID';

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      {/* Order Number */}
                      <td style={{ padding: '14px 18px' }}>
                        <Link href={`/admin/orders/${order.id}`} style={{ fontWeight: 800, color: '#7E22CE', textDecoration: 'none' }}>
                          {order.orderNumber}
                        </Link>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'}
                        </div>
                      </td>

                      {/* Customer & Destination */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#1E1B4B' }}>{order.customerName}</div>
                        <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                          {order.customerMobile} | {order.city}, {order.pincode}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 18px', color: '#4B5563', fontSize: '12px' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#1E1B4B' }}>
                        ₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Payment Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: isPaid ? '#ECFDF5' : '#FEF2F2',
                            color: isPaid ? '#047857' : '#DC2626',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Order Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '12px',
                            backgroundColor: statusPill.bg,
                            color: statusPill.color,
                            border: `1px solid ${statusPill.border}`,
                            fontSize: '11.5px',
                            fontWeight: 800,
                          }}
                        >
                          {statusPill.label}
                        </span>
                        {order.refundStatus === 'REQUESTED' && (
                          <div style={{ fontSize: '10.5px', color: '#D97706', fontWeight: 800, marginTop: '3px' }}>
                            ⚠️ Refund Requested
                          </div>
                        )}
                      </td>

                      {/* Shiprocket / AWB */}
                      <td style={{ padding: '14px 18px', fontSize: '12px' }}>
                        {order.awbCode ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803D', fontWeight: 700 }}>
                            <Truck size={13} />
                            <span>{order.awbCode}</span>
                          </div>
                        ) : order.isLabelGenerated ? (
                          <span style={{ color: '#2563EB', fontWeight: 700 }}>Label Ready</span>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>Not Assigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {order.awbCode && (
                            <button
                              type="button"
                              onClick={() => handleSyncShiprocket(order.id)}
                              disabled={syncingOrderId === order.id}
                              title="Sync Live Status from Shiprocket"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#F5F3FF',
                                border: '1px solid #DDD6FE',
                                color: '#6D28D9',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <RefreshCw size={12} className={syncingOrderId === order.id ? 'spin-anim' : ''} />
                              <span>{syncingOrderId === order.id ? 'Syncing...' : 'Sync Live'}</span>
                            </button>
                          )}

                          {!order.isLabelGenerated && order.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => handleQuickLabelGenerate(order.id)}
                              title="Generate Shiprocket Shipping Label"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#FAF5FF',
                                border: '1px solid #E9D5FF',
                                color: '#7E22CE',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Truck size={12} />
                              <span>Generate Label</span>
                            </button>
                          )}

                          {order.awbCode && (
                            <button
                              type="button"
                              onClick={() => handleOpenTrackingModal(order)}
                              title="View Real-Time Shiprocket Tracking Timeline"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#1D4ED8',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Truck size={12} />
                              <span>Live Tracking</span>
                            </button>
                          )}

                          <Link
                            href={`/admin/orders/${order.id}`}
                            title="View Full Order Details"
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#F3F4F6',
                              border: '1px solid #E5E7EB',
                              color: '#374151',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            zIndex: 9999,
            padding: '20px',
            boxSizing: 'border-box',
          }}
          onClick={() => setTrackingModalOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '620px',
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
                    Shiprocket Live Tracking
                  </h3>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 800 }}>
                    Live API
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '3px' }}>
                  Order #{trackingModalOrder.orderNumber} • {trackingModalOrder.customerName}
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

            {/* Courier & AWB Card */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Courier Partner</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {trackingModalOrder.courierName || 'Shiprocket Courier'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>AWB Number</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B', marginTop: '2px', fontFamily: 'monospace' }}>
                  {trackingModalOrder.awbCode || 'Assigned on Dispatch'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Current Status</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#7E22CE', marginTop: '2px' }}>
                  {trackingData?.currentStatus || trackingModalOrder.status}
                </div>
              </div>
            </div>

            {/* Live Shiprocket Link */}
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
                  <span>Open Shiprocket Tracking Portal</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleSyncShiprocket(trackingModalOrder.id)}
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
                  <span>{syncingOrderId === trackingModalOrder.id ? 'Syncing...' : 'Poll API'}</span>
                </button>
              </div>
            )}

            {/* Tracking Activities Timeline */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>
                Shipment Milestones & Activity
              </h4>
              {trackingLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #7E22CE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                  Fetching live tracking from Shiprocket API...
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
                  Courier has received shipping manifest. Tracking milestones will populate as the parcel moves through transit hubs.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
