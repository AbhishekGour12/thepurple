"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Search,
  RefreshCw,
  Calendar,
  Percent,
  DollarSign,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { couponsApi } from '@/lib/api/admin/coupons';

export default function AdminCouponsPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const canManage = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive | expired
  const [typeFilter, setTypeFilter] = useState('all'); // all | PERCENTAGE | FLAT
  const [copiedCode, setCopiedCode] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal State for Create / Edit
  const [modal, setModal] = useState({
    isOpen: false,
    isEdit: false,
    id: null,
    code: '',
    discountType: 'PERCENTAGE', // PERCENTAGE | FLAT | FREE_SHIPPING
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '1000',
    isAutoApply: false,
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, coupon: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await couponsApi.list({
        search,
        status: statusFilter,
        type: typeFilter,
        limit: 100,
      });
      if (res?.coupons) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Statistics
  const stats = useMemo(() => {
    const total = coupons.length;
    const now = new Date();
    const active = coupons.filter(
      (c) => c.isActive && new Date(c.startDate) <= now && new Date(c.endDate) >= now
    ).length;
    const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const expired = coupons.filter((c) => new Date(c.endDate) < now).length;
    return { total, active, totalUsed, expired };
  }, [coupons]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreate = () => {
    const today = new Date();
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const formatDateForInput = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setModal({
      isOpen: true,
      isEdit: false,
      id: null,
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '15',
      minOrderAmount: '999',
      maxDiscountAmount: '500',
      startDate: formatDateForInput(today),
      endDate: formatDateForInput(nextMonth),
      usageLimit: '1000',
      isAutoApply: false,
      isActive: true,
    });
  };

  const handleOpenEdit = (coupon) => {
    const formatDateForInput = (d) => {
      if (!d) return '';
      const date = new Date(d);
      const pad = (n) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setModal({
      isOpen: true,
      isEdit: true,
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: String(coupon.discountValue || ''),
      minOrderAmount: String(coupon.minOrderAmount || '0'),
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
      startDate: formatDateForInput(coupon.startDate),
      endDate: formatDateForInput(coupon.endDate),
      usageLimit: String(coupon.usageLimit || '1000'),
      isAutoApply: Boolean(coupon.isAutoApply),
      isActive: Boolean(coupon.isActive),
    });
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const newStatus = !coupon.isActive;
      await couponsApi.updateStatus(coupon.id, newStatus);
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c))
      );
      showToast(`Coupon ${coupon.code} is now ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.coupon) return;
    try {
      await couponsApi.delete(deleteConfirm.coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteConfirm.coupon.id));
      showToast(`Coupon ${deleteConfirm.coupon.code} deleted successfully`);
      setDeleteConfirm({ isOpen: false, coupon: null });
    } catch (err) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modal.code.trim()) {
      showToast('Coupon code is required', 'error');
      return;
    }
    if (modal.discountType !== 'FREE_SHIPPING' && (!modal.discountValue || parseFloat(modal.discountValue) <= 0)) {
      showToast('Please enter a valid discount value', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: modal.code.trim().toUpperCase(),
        discountType: modal.discountType,
        discountValue: modal.discountType === 'FREE_SHIPPING' ? 0 : parseFloat(modal.discountValue || 0),
        minOrderAmount: parseFloat(modal.minOrderAmount || 0),
        maxDiscountAmount: modal.maxDiscountAmount ? parseFloat(modal.maxDiscountAmount) : null,
        startDate: modal.startDate ? new Date(modal.startDate) : new Date(),
        endDate: modal.endDate ? new Date(modal.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: parseInt(modal.usageLimit || 1000, 10),
        isAutoApply: Boolean(modal.isAutoApply),
        isActive: Boolean(modal.isActive),
      };

      if (modal.isEdit) {
        const res = await couponsApi.update(modal.id, payload);
        if (res?.coupon) {
          setCoupons((prev) => prev.map((c) => (c.id === modal.id ? res.coupon : c)));
          showToast(`Coupon ${res.coupon.code} updated successfully`);
        }
      } else {
        const res = await couponsApi.create(payload);
        if (res?.coupon) {
          setCoupons((prev) => [res.coupon, ...prev]);
          showToast(`Coupon ${res.coupon.code} created successfully! 🎉`);
        }
      }
      setModal({ ...modal, isOpen: false });
    } catch (err) {
      showToast(err.message || 'Failed to save coupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13.5px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            animation: 'slideIn 0.2s ease',
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE' }}>
              <Tag size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E1B4B', margin: 0, letterSpacing: '-0.02em' }}>
                Coupons & Discounts
              </h1>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0' }}>
                Create, update, and manage discount promo codes for customer carts
              </p>
            </div>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: '#7E22CE',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} />
            <span>Create New Coupon</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Coupons</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E1B4B', marginTop: '4px' }}>{stats.total}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Offers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>{stats.active}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7E22CE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Times Used</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7E22CE', marginTop: '4px' }}>{stats.totalUsed}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expired / Inactive</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>{stats.expired}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px', maxWidth: '400px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by coupon code..."
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              color: '#1E1B4B',
              outline: 'none',
              backgroundColor: '#FAF5FF',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1E1B4B',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="expired">Expired Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1E1B4B',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Discount Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT">Flat Rupees (₹)</option>
            <option value="FREE_SHIPPING">Free Shipping (₹0 Delivery)</option>
          </select>

          <button
            type="button"
            onClick={loadCoupons}
            title="Refresh list"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#7E22CE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Coupons Table / Grid */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF5FF', borderBottom: '1.5px solid #E9D5FF' }}>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Coupon Code</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Discount Offer</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Min Order / Max Cap</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Validity Date</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Usage Limit</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: '#7E22CE' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Loading coupons...</div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <Tag size={36} color="#C084FC" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B' }}>No Coupons Found</div>
                    <div style={{ fontSize: '12.5px', color: '#6B7280', marginTop: '4px' }}>
                      Try adjusting your search filter or create a new coupon code.
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const now = new Date();
                  const isExpired = new Date(coupon.endDate) < now;
                  const isUpcoming = new Date(coupon.startDate) > now;
                  const isPercentage = coupon.discountType === 'PERCENTAGE';

                  return (
                    <tr
                      key={coupon.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Code */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#FAF5FF',
                              border: '1.5px dashed #C084FC',
                              color: '#7E22CE',
                              fontSize: '13px',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                            }}
                          >
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy Code"
                            style={{
                              border: 'none',
                              background: 'none',
                              color: copiedCode === coupon.code ? '#10B981' : '#9CA3AF',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            {copiedCode === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span
                            style={{
                              padding: '4px 9px',
                              borderRadius: '6px',
                              backgroundColor:
                                coupon.discountType === 'FREE_SHIPPING'
                                  ? '#ECFDF5'
                                  : isPercentage
                                  ? '#FAF5FF'
                                  : '#EEF2FF',
                              color:
                                coupon.discountType === 'FREE_SHIPPING'
                                  ? '#059669'
                                  : isPercentage
                                  ? '#7E22CE'
                                  : '#4338CA',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            {coupon.discountType === 'FREE_SHIPPING'
                              ? '🚚 FREE DELIVERY (₹0)'
                              : isPercentage
                              ? `${coupon.discountValue}% OFF`
                              : `FLAT ₹${coupon.discountValue} OFF`}
                          </span>

                          {coupon.isAutoApply && (
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: '#7E22CE',
                                backgroundColor: '#F3E8FF',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              ⚡ Auto-Applies on Cart
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Min Order & Max Cap */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B' }}>
                          Min: ₹{parseFloat(coupon.minOrderAmount || 0).toLocaleString('en-IN')}
                        </div>
                        {isPercentage && coupon.maxDiscountAmount && (
                          <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                            Max Cap: ₹{parseFloat(coupon.maxDiscountAmount).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Validity Date */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: '12.5px', color: '#1E1B4B', fontWeight: 600 }}>
                          {new Date(coupon.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} —{' '}
                          {new Date(coupon.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {isExpired ? (
                          <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>Expired</span>
                        ) : isUpcoming ? (
                          <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 700 }}>Upcoming</span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>Active Now</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B' }}>
                          {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>redeemed</div>
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: '16px 18px' }}>
                        {canManage ? (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(coupon)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              border: 'none',
                              backgroundColor: coupon.isActive && !isExpired ? '#ECFDF5' : '#FEF2F2',
                              color: coupon.isActive && !isExpired ? '#047857' : '#DC2626',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: coupon.isActive && !isExpired ? '#10B981' : '#EF4444' }} />
                            <span>{coupon.isActive && !isExpired ? 'Active' : 'Inactive'}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: coupon.isActive ? '#047857' : '#DC2626' }}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        {canManage && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(coupon)}
                              title="Edit Coupon"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FAF5FF',
                                color: '#7E22CE',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm({ isOpen: true, coupon })}
                              title="Delete Coupon"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #FEE2E2',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT COUPON */}
      {/* ========================================================================= */}
      {modal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1px solid #E5E7EB',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE' }}>
                  <Tag size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                    {modal.isEdit ? 'Edit Coupon Code' : 'Create New Coupon'}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                    Configure discount rules and redemption limits
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModal({ ...modal, isOpen: false })}
                style={{ border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* 1. Coupon Code */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                    Coupon Promo Code <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modal.code}
                    onChange={(e) => setModal({ ...modal, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WELCOME15, FESTIVE500"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #E9D5FF',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#7E22CE',
                      backgroundColor: '#FAF5FF',
                      outline: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>
                    Customers will enter this code during checkout
                  </span>
                </div>

                {/* 2. Discount Type: Percentage vs Flat vs Free Shipping */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#374151', marginBottom: '8px' }}>
                    Discount Type <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: modal.discountType === 'PERCENTAGE' ? '2px solid #7E22CE' : '1px solid #E5E7EB',
                        backgroundColor: modal.discountType === 'PERCENTAGE' ? '#FAF5FF' : '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="discountType"
                        checked={modal.discountType === 'PERCENTAGE'}
                        onChange={() => setModal({ ...modal, discountType: 'PERCENTAGE' })}
                        style={{ accentColor: '#7E22CE' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E1B4B' }}>Percentage (%)</div>
                        <div style={{ fontSize: '10.5px', color: '#6B7280' }}>e.g. 10%, 20% off</div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: modal.discountType === 'FLAT' ? '2px solid #7E22CE' : '1px solid #E5E7EB',
                        backgroundColor: modal.discountType === 'FLAT' ? '#FAF5FF' : '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="discountType"
                        checked={modal.discountType === 'FLAT'}
                        onChange={() => setModal({ ...modal, discountType: 'FLAT' })}
                        style={{ accentColor: '#7E22CE' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E1B4B' }}>Flat Rupees (₹)</div>
                        <div style={{ fontSize: '10.5px', color: '#6B7280' }}>e.g. Flat ₹500 off</div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: modal.discountType === 'FREE_SHIPPING' ? '2px solid #059669' : '1px solid #E5E7EB',
                        backgroundColor: modal.discountType === 'FREE_SHIPPING' ? '#ECFDF5' : '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="discountType"
                        checked={modal.discountType === 'FREE_SHIPPING'}
                        onChange={() => setModal({ ...modal, discountType: 'FREE_SHIPPING', discountValue: '0' })}
                        style={{ accentColor: '#059669' }}
                      />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#065F46' }}>Free Shipping (₹0)</div>
                        <div style={{ fontSize: '10.5px', color: '#047857' }}>Free Delivery Offer</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. Discount Value & Maximum Cap */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      {modal.discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}{' '}
                      <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={modal.discountType === 'PERCENTAGE' ? '100' : '50000'}
                      value={modal.discountValue}
                      onChange={(e) => setModal({ ...modal, discountValue: e.target.value })}
                      placeholder={modal.discountType === 'PERCENTAGE' ? '15' : '500'}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#1E1B4B',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      Min Cart Value (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={modal.minOrderAmount}
                      onChange={(e) => setModal({ ...modal, minOrderAmount: e.target.value })}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '13.5px',
                        color: '#1E1B4B',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* 4. Max Discount Cap (Only for Percentage) */}
                {modal.discountType === 'PERCENTAGE' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      Max Discount Limit (₹) <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 400 }}>(Optional cap)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={modal.maxDiscountAmount}
                      onChange={(e) => setModal({ ...modal, maxDiscountAmount: e.target.value })}
                      placeholder="e.g. 500 (Max ₹500 off)"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '13.5px',
                        color: '#1E1B4B',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {/* 5. Date Range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={modal.startDate}
                      onChange={(e) => setModal({ ...modal, startDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '12.5px',
                        color: '#1E1B4B',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={modal.endDate}
                      onChange={(e) => setModal({ ...modal, endDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '12.5px',
                        color: '#1E1B4B',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* 6. Usage Limit, Auto-Apply on Cart & Active Switch */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      Max Redemptions Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={modal.usageLimit}
                      onChange={(e) => setModal({ ...modal, usageLimit: e.target.value })}
                      placeholder="1000"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '13px',
                        color: '#1E1B4B',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={modal.isAutoApply}
                        onChange={(e) => setModal({ ...modal, isAutoApply: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#7E22CE', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E1B4B' }}>
                          ⚡ Auto-Apply Offer on Cart (No coupon code typing required)
                        </span>
                        <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                          When customer cart subtotal reaches ₹{modal.minOrderAmount || '0'}, this {modal.discountType === 'FREE_SHIPPING' ? 'Free Shipping' : 'discount'} offer will apply automatically!
                        </div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderTop: '1px solid #F3E8FF', paddingTop: '8px' }}>
                      <input
                        type="checkbox"
                        checked={modal.isActive}
                        onChange={(e) => setModal({ ...modal, isActive: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#7E22CE', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E1B4B' }}>
                        Activate Offer Immediately
                      </span>
                    </label>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div
                  style={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#7E22CE', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Live Cart Preview:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#581C87' }}>
                        {modal.code || 'COUPON_CODE'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#4B5563' }}>
                        {modal.discountType === 'PERCENTAGE'
                          ? `Get ${modal.discountValue || '0'}% OFF ${modal.maxDiscountAmount ? `up to ₹${modal.maxDiscountAmount}` : ''}`
                          : `Get Flat ₹${modal.discountValue || '0'} OFF`}{' '}
                        {parseFloat(modal.minOrderAmount || 0) > 0 ? `on orders above ₹${modal.minOrderAmount}` : 'on all orders'}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#7E22CE',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {modal.discountType === 'PERCENTAGE' ? `${modal.discountValue || '0'}% OFF` : `₹${modal.discountValue || '0'} OFF`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                <button
                  type="button"
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#6B7280',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#7E22CE',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
                  }}
                >
                  {submitting ? 'Saving...' : modal.isEdit ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirm.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E1B4B', margin: '0 0 8px' }}>
              Delete Coupon?
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
              Are you sure you want to permanently delete coupon <strong>"{deleteConfirm.coupon?.code}"</strong>? Customers will no longer be able to use it.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, coupon: null })}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#6B7280',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
