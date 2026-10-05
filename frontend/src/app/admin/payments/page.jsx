'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Eye,
  RefreshCw,
  Calendar,
  X,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  User,
  Phone,
  Mail,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import { adminPaymentsApi } from '@/lib/api/admin/payments';
import { exportToCSV } from '@/lib/utils/exportToExcel';

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val || 0);

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalCollected: 0,
    successCount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    failedCount: 0,
    failedAmount: 0,
    refundedCount: 0,
    refundedAmount: 0,
    razorpayVolume: 0,
    razorpayCount: 0,
    codVolume: 0,
    codCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Filters State
  const [search, setSearch] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  // Selected Transaction for Details Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await adminPaymentsApi.getStats();
      const statsData = res?.data || res;
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.warn('Could not load payment stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search.trim()) params.search = search.trim();
      if (gatewayFilter !== 'ALL') params.gateway = gatewayFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await adminPaymentsApi.getAll(params);
      const data = res?.data || res;
      if (data) {
        setPayments(data.payments || (Array.isArray(data) ? data : []));
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total || (data.payments ? data.payments.length : 0),
            totalPages: data.pagination.totalPages || 1,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, gatewayFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadPayments();
  };

  const handleResetFilters = () => {
    setSearch('');
    setGatewayFilter('ALL');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        search: search.trim() || undefined,
        gateway: gatewayFilter !== 'ALL' ? gatewayFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await adminPaymentsApi.exportData(params);
      const data = res?.payments || res?.data?.payments || (Array.isArray(res) ? res : []);

      if (data.length === 0) {
        alert('No payment records match the applied filters to export.');
        return;
      }

      exportToCSV(data, 'ThePurple-Payments-Report', {
        transactionId: 'Transaction ID',
        orderNumber: 'Order Number',
        gatewayPaymentId: 'Gateway Reference ID',
        customerName: 'Customer Name',
        customerMobile: 'Customer Phone',
        customerEmail: 'Customer Email',
        gateway: 'Payment Method',
        amount: 'Amount (INR)',
        status: 'Payment Status',
        orderStatus: 'Order Status',
        createdAt: 'Transaction Date',
        city: 'City',
        state: 'State',
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Could not generate export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 800 }}>
            <CheckCircle2 size={12} /> SUCCESS
          </span>
        );
      case 'PENDING':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: 800 }}>
            <Clock size={12} /> PENDING
          </span>
        );
      case 'FAILED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: 800 }}>
            <AlertCircle size={12} /> FAILED
          </span>
        );
      case 'REFUNDED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '12px', backgroundColor: '#F3E8FF', color: '#7E22CE', fontSize: '11px', fontWeight: 800 }}>
            <RotateCcw size={12} /> REFUNDED
          </span>
        );
      default:
        return (
          <span style={{ padding: '3px 9px', borderRadius: '12px', backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: '11px', fontWeight: 700 }}>
            {status}
          </span>
        );
    }
  };

  const getGatewayBadge = (gw) => {
    if (gw === 'RAZORPAY') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF', fontSize: '11px', fontWeight: 800 }}>
          <CreditCard size={12} /> Razorpay (Prepaid)
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', fontSize: '11px', fontWeight: 800 }}>
        <DollarSign size={12} /> Cash on Delivery (COD)
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', fontFamily: 'var(--font-heading)' }}>
      {/* ─── 1. Header Banner ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 50%, #6D28D9 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: '24px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 30px rgba(46, 16, 101, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.15)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Financial Center
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 900, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
            Payments & Transactions
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#E9D5FF' }}>
            Monitor real-time gateway payments, Cash on Delivery settlement logs, and financial records.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s ease',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: '#10B981',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              cursor: exporting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Download size={15} />
            <span>{exporting ? 'Exporting...' : 'Export to Excel / CSV'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Top Summary KPI Scorecard ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Collected */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E9D5FF',
            boxShadow: '0 2px 10px rgba(126, 34, 206, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Total Realized Revenue
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#7E22CE" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E1B4B' }}>
            {formatINR(stats.totalCollected)}
          </div>
          <div style={{ fontSize: '11.5px', color: '#15803D', fontWeight: 700, marginTop: '4px' }}>
            {stats.successCount} successful settled orders
          </div>
        </div>

        {/* Razorpay Online Volume */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E9D5FF',
            boxShadow: '0 2px 10px rgba(126, 34, 206, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Online Razorpay Volume
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E1B4B' }}>
            {formatINR(stats.razorpayVolume)}
          </div>
          <div style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: 700, marginTop: '4px' }}>
            {stats.razorpayCount} prepaid transactions
          </div>
        </div>

        {/* Cash on Delivery (COD) Volume */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E9D5FF',
            boxShadow: '0 2px 10px rgba(126, 34, 206, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Cash on Delivery (COD)
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E1B4B' }}>
            {formatINR(stats.codVolume)}
          </div>
          <div style={{ fontSize: '11.5px', color: '#D97706', fontWeight: 700, marginTop: '4px' }}>
            {stats.codCount} COD orders created
          </div>
        </div>

        {/* Pending & Failed Volume */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E9D5FF',
            boxShadow: '0 2px 10px rgba(126, 34, 206, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
              Pending / Failed
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} color="#DC2626" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#DC2626' }}>
            {formatINR(stats.pendingAmount + stats.failedAmount)}
          </div>
          <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 700, marginTop: '4px' }}>
            {stats.pendingCount} pending • {stats.failedCount} failed
          </div>
        </div>
      </div>

      {/* ─── 3. Comprehensive Filter Bar ─────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E9D5FF',
          padding: '18px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(107, 33, 168, 0.03)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Keyword Search */}
          <div style={{ flex: 2, minWidth: '260px', position: 'relative' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Order #, Gateway Transaction ID, Customer Name, Mobile, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1.5px solid #E5E7EB',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FAF8FC',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Gateway Method Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={gatewayFilter}
              onChange={(e) => {
                setGatewayFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #E5E7EB',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FAF8FC',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              <option value="ALL">All Gateways</option>
              <option value="RAZORPAY">Razorpay (Online)</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '140px' }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #E5E7EB',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FAF8FC',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success / Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1.5px solid #E5E7EB',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FAF8FC',
                color: '#374151',
              }}
              title="Start Date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1.5px solid #E5E7EB',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FAF8FC',
                color: '#374151',
              }}
              title="End Date"
            />
          </div>

          {/* Filter / Search Button */}
          <button
            type="submit"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: '#7E22CE',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Filter size={14} />
            <span>Apply</span>
          </button>

          {/* Reset Filters */}
          {(search || gatewayFilter !== 'ALL' || statusFilter !== 'ALL' || startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* ─── 4. Payments Data Table ─────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E9D5FF',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(107, 33, 168, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF5FF', borderBottom: '1.5px solid #E9D5FF', color: '#581C87', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 18px' }}>Order Number</th>
                <th style={{ padding: '14px 18px' }}>Transaction / Gateway Ref</th>
                <th style={{ padding: '14px 18px' }}>Customer Info</th>
                <th style={{ padding: '14px 18px' }}>Amount</th>
                <th style={{ padding: '14px 18px' }}>Payment Method</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Date & Time</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '60px 20px', color: '#7E22CE' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #7E22CE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <span style={{ fontWeight: 700 }}>Loading payment transactions...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Receipt size={40} color="#9CA3AF" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B', marginBottom: '4px' }}>
                      No payment records found
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0 }}>
                      Try adjusting your search criteria or resetting filters.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const customerName = payment.order?.customerName || payment.order?.user?.name || 'Customer';
                  const customerPhone = payment.order?.customerMobile || payment.order?.user?.mobile || '';
                  const customerEmail = payment.order?.customerEmail || payment.order?.user?.email || '';

                  return (
                    <tr
                      key={payment.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF8FC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* Order Number */}
                      <td style={{ padding: '14px 18px' }}>
                        {payment.order?.orderNumber ? (
                          <Link
                            href={`/admin/orders/${payment.order.id || payment.order.orderNumber}`}
                            style={{
                              fontWeight: 800,
                              color: '#7E22CE',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{payment.order.orderNumber}</span>
                            <ExternalLink size={12} />
                          </Link>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>N/A</span>
                        )}
                      </td>

                      {/* Transaction / Gateway Ref */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1E1B4B', fontSize: '12.5px' }}>
                          {payment.gatewayPaymentId || payment.gatewayOrderId || payment.id.substring(0, 18) + '...'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          ID: {payment.id.substring(0, 8)}...
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#1E1B4B' }}>{customerName}</div>
                        {customerPhone && (
                          <div style={{ fontSize: '11.5px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={10} /> {customerPhone}
                          </div>
                        )}
                        {customerEmail && (
                          <div style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={10} /> {customerEmail}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#1E1B4B' }}>
                          {formatINR(payment.amount)}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: '14px 18px' }}>
                        {getGatewayBadge(payment.paymentGateway)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {getStatusBadge(payment.status)}
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '14px 18px', color: '#4B5563', fontSize: '12px' }}>
                        <div>
                          {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          {new Date(payment.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setDetailsModalOpen(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#FAF5FF',
                            border: '1px solid #E9D5FF',
                            color: '#7E22CE',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#FAF8FC',
            borderTop: '1px solid #E9D5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '12.5px',
            color: '#6B7280',
          }}
        >
          <div>
            Showing <strong>{payments.length}</strong> of <strong>{pagination.total}</strong> records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: pagination.page <= 1 ? '#F3F4F6' : '#FFFFFF',
                color: pagination.page <= 1 ? '#9CA3AF' : '#374151',
                fontWeight: 700,
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            <span>
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: pagination.page >= pagination.totalPages ? '#F3F4F6' : '#FFFFFF',
                color: pagination.page >= pagination.totalPages ? '#9CA3AF' : '#374151',
                fontWeight: 700,
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5. Transaction Detail Slide-Out / Modal ────────────────────── */}
      {detailsModalOpen && selectedPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setDetailsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Receipt size={22} color="#7E22CE" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E1B4B', margin: 0 }}>
                  Transaction Receipt Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#6B7280" />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Top Amount Banner */}
              <div
                style={{
                  backgroundColor: '#FAF5FF',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  border: '1.5px solid #E9D5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#7E22CE', textTransform: 'uppercase' }}>
                    Payment Total
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E1B4B' }}>
                    {formatINR(selectedPayment.amount)}
                  </div>
                </div>
                <div>{getStatusBadge(selectedPayment.status)}</div>
              </div>

              {/* Transaction Key Value Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12.5px' }}>
                <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
                  <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                    TRANSACTION ID
                  </div>
                  <div style={{ fontWeight: 800, color: '#1E1B4B', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {selectedPayment.id}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
                  <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                    PAYMENT GATEWAY
                  </div>
                  <div>{getGatewayBadge(selectedPayment.paymentGateway)}</div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
                  <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                    GATEWAY PAYMENT ID
                  </div>
                  <div style={{ fontWeight: 800, color: '#1E1B4B', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {selectedPayment.gatewayPaymentId || 'N/A (Cash on Delivery)'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
                  <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
                    TRANSACTION TIMESTAMP
                  </div>
                  <div style={{ fontWeight: 800, color: '#1E1B4B' }}>
                    {new Date(selectedPayment.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Associated Order Details */}
              {selectedPayment.order && (
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#1E1B4B' }}>
                      Associated Order #{selectedPayment.order.orderNumber}
                    </div>
                    <Link
                      href={`/admin/orders/${selectedPayment.order.id || selectedPayment.order.orderNumber}`}
                      style={{ color: '#7E22CE', fontWeight: 800, fontSize: '12px', textDecoration: 'none' }}
                    >
                      Open Order →
                    </Link>
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#4B5563', lineHeight: 1.6 }}>
                    <div><strong>Customer:</strong> {selectedPayment.order.customerName}</div>
                    <div><strong>Phone:</strong> {selectedPayment.order.customerMobile}</div>
                    {selectedPayment.order.customerEmail && <div><strong>Email:</strong> {selectedPayment.order.customerEmail}</div>}
                    <div><strong>Delivery Location:</strong> {selectedPayment.order.city}, {selectedPayment.order.state} - {selectedPayment.order.pincode}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
