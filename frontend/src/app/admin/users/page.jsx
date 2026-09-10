"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  Calendar,
  Shield,
  ShoppingBag,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';
import { adminUserApi } from '@/lib/api/admin/users';

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function AdminUsersManagementPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const canManage = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';

  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, googleAuth: 0, blocked: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [authFilter, setAuthFilter] = useState('');

  // Toast & Modal
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.listUsers({
        search,
        status: statusFilter || undefined,
        authProvider: authFilter || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      setUsers(res?.users || []);
      if (res?.summary) setSummary(res.summary);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      showToast(err?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, authFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Status Update
  const handleUpdateStatus = async (userId, nextStatus) => {
    setStatusUpdating(true);
    try {
      await adminUserApi.updateUserStatus(userId, nextStatus);
      showToast(`User status updated to ${nextStatus}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      showToast(err?.message || 'Failed to update user status', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', fontFamily: 'var(--font-heading)' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#1E1B4B',
            margin: '0 0 6px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Users size={28} color="#7E22CE" />
          <span>Customer & User Accounts</span>
        </h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '14.5px' }}>
          View registered customer profiles, login activity, verification status, and lifetime purchase metrics.
        </p>
      </div>

      {/* 4 Summary KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Total Registered</span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1E1B4B', margin: '8px 0 4px' }}>
            {summary.total || users.length}
          </h2>
          <span style={{ fontSize: '12px', color: '#7E22CE', fontWeight: 700 }}>All user accounts</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Active Customers</span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A', margin: '8px 0 4px' }}>
            {summary.active || users.filter((u) => u.status === 'ACTIVE').length}
          </h2>
          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700 }}>Eligible to purchase</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Google Auth Verified</span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0284C7', margin: '8px 0 4px' }}>
            {summary.googleAuth || users.filter((u) => u.authProvider === 'GOOGLE').length}
          </h2>
          <span style={{ fontSize: '12px', color: '#0284C7', fontWeight: 700 }}>Single Sign-On login</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Suspended / Blocked</span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#DC2626', margin: '8px 0 4px' }}>
            {summary.blocked || users.filter((u) => u.status === 'BLOCKED').length}
          </h2>
          <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 700 }}>Access restricted</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <Search
            size={18}
            color="#94A3B8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search customer by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              fontSize: '13.5px',
              color: '#1E1B4B',
              outline: 'none',
              backgroundColor: '#F8FAFC',
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="INACTIVE">Inactive Accounts</option>
            <option value="BLOCKED">Blocked Accounts</option>
          </select>
        </div>

        {/* Auth Provider Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={authFilter}
            onChange={(e) => setAuthFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="">All Providers</option>
            <option value="GOOGLE">Google SSO</option>
            <option value="LOCAL">Direct / Mobile</option>
          </select>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            backgroundColor: '#F1F5F9',
            border: 'none',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Users Data Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>Loading customer directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <Users size={40} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px' }}>
              No customers found
            </h3>
            <p style={{ fontSize: '13.5px', margin: 0 }}>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>Customer Name</th>
                  <th style={{ padding: '14px 20px' }}>Contact Info</th>
                  <th style={{ padding: '14px 20px' }}>Auth Method</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Orders / Spend</th>
                  <th style={{ padding: '14px 20px' }}>Joined Date</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isActive = user.status === 'ACTIVE';
                  const isBlocked = user.status === 'BLOCKED';
                  const isGoogle = user.authProvider === 'GOOGLE';

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#EDE9FE',
                              color: '#7E22CE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '14px',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              (user.name || 'U')[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 800, color: '#1E1B4B', fontSize: '14px' }}>
                              {user.name || 'Anonymous User'}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                              {user.role || 'CUSTOMER'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '13px', color: '#334155' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <Mail size={13} color="#94A3B8" />
                            <span>{user.email || 'No email provided'}</span>
                          </div>
                          {user.mobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '12px' }}>
                              <Phone size={12} color="#94A3B8" />
                              <span>{user.mobile}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Auth Provider */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            backgroundColor: isGoogle ? '#EFF6FF' : '#F1F5F9',
                            color: isGoogle ? '#2563EB' : '#475569',
                          }}
                        >
                          <span>{isGoogle ? '🌐 Google SSO' : '📱 Mobile / Direct'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            backgroundColor: isActive ? '#DCFCE7' : isBlocked ? '#FEE2E2' : '#F1F5F9',
                            color: isActive ? '#15803D' : isBlocked ? '#DC2626' : '#64748B',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#16A34A' : isBlocked ? '#DC2626' : '#94A3B8',
                            }}
                          />
                          <span>{user.status}</span>
                        </span>
                      </td>

                      {/* Orders Count & Spend */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'block', fontWeight: 800, color: '#1E1B4B', fontSize: '13.5px' }}>
                          {formatINR(user.totalSpent)}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          {user.ordersCount || 0} order{user.ordersCount === 1 ? '' : 's'}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td style={{ padding: '16px 20px', fontSize: '12.5px', color: '#64748B' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#FAF5FF',
                            border: '1px solid #E9D5FF',
                            color: '#7E22CE',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── USER DETAILS MODAL ────────────────────────────────────────────── */}
      {selectedUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#EDE9FE',
                  color: '#7E22CE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  overflow: 'hidden',
                }}
              >
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (selectedUser.name || 'U')[0].toUpperCase()
                )}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#1E1B4B' }}>
                  {selectedUser.name || 'Customer Profile'}
                </h3>
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  ID: {selectedUser.id}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11.5px', fontWeight: 700 }}>EMAIL</span>
                <strong style={{ color: '#1E1B4B' }}>{selectedUser.email || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11.5px', fontWeight: 700 }}>MOBILE</span>
                <strong style={{ color: '#1E1B4B' }}>{selectedUser.mobile || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11.5px', fontWeight: 700 }}>AUTH PROVIDER</span>
                <strong style={{ color: '#1E1B4B' }}>{selectedUser.authProvider}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11.5px', fontWeight: 700 }}>TOTAL SPENT</span>
                <strong style={{ color: '#7E22CE' }}>{formatINR(selectedUser.totalSpent)}</strong>
              </div>
            </div>

            {/* Status Management Actions */}
            {canManage && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Manage Account Access Status:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={statusUpdating || selectedUser.status === 'ACTIVE'}
                    onClick={() => handleUpdateStatus(selectedUser.id, 'ACTIVE')}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '8px',
                      border: '1px solid #DCFCE7',
                      backgroundColor: selectedUser.status === 'ACTIVE' ? '#DCFCE7' : '#FFFFFF',
                      color: '#15803D',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    Set Active
                  </button>
                  <button
                    type="button"
                    disabled={statusUpdating || selectedUser.status === 'INACTIVE'}
                    onClick={() => handleUpdateStatus(selectedUser.id, 'INACTIVE')}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: selectedUser.status === 'INACTIVE' ? '#F1F5F9' : '#FFFFFF',
                      color: '#64748B',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    Set Inactive
                  </button>
                  <button
                    type="button"
                    disabled={statusUpdating || selectedUser.status === 'BLOCKED'}
                    onClick={() => handleUpdateStatus(selectedUser.id, 'BLOCKED')}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '8px',
                      border: '1px solid #FEE2E2',
                      backgroundColor: selectedUser.status === 'BLOCKED' ? '#FEE2E2' : '#FFFFFF',
                      color: '#DC2626',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    Block Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
