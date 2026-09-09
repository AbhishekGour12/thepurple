"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  UserPlus,
  ShieldCheck,
  Search,
  RotateCcw,
  Power,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  X,
  Mail,
  User,
} from 'lucide-react';
import { adminUserApi } from '@/lib/api/admin/admins';
import { BusyButtonLabel } from '@/components/admin/BusyUI';

export default function AdminManagementPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'MANAGER' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const fetchAdmins = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminUserApi.listAdmins({
        page,
        limit: 15,
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setAdmins(data?.admins || []);
      setPagination(data?.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch {
      // Error handled by client interceptor
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins(1);
    }
  }, [isSuperAdmin, fetchAdmins]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await adminUserApi.createAdmin(formData);
      setSuccessInfo(res);
      setIsCreateOpen(false);
      setFormData({ name: '', email: '', role: 'MANAGER' });
      fetchAdmins(1);
    } catch (err) {
      setFormError(err.message || 'Failed to create administrator');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const nextStatus = !admin.isActive;
    const confirmMsg = nextStatus
      ? `Activate administrator account for ${admin.name}?`
      : `Deactivate administrator account for ${admin.name}? They will not be able to log in.`;

    if (window.confirm(confirmMsg)) {
      try {
        await adminUserApi.updateAdminStatus(admin.id, nextStatus);
        fetchAdmins(pagination.page);
      } catch (err) {
        alert(err.message || 'Action failed');
      }
    }
  };

  const handleResetAccess = async (admin) => {
    if (
      window.confirm(
        `Generate and send a new temporary password to ${admin.email}? Their existing sessions will be invalidated.`
      )
    ) {
      try {
        const res = await adminUserApi.resetAdminAccess(admin.id);
        alert(res?.message || 'New temporary password sent successfully');
        fetchAdmins(pagination.page);
      } catch (err) {
        alert(err.message || 'Failed to reset access');
      }
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (
      window.confirm(
        `Are you sure you want to PERMANENTLY DELETE administrator "${admin.name}" (${admin.email})?\n\nThis will remove their account and revoke all access. This action cannot be undone.`
      )
    ) {
      try {
        const res = await adminUserApi.deleteAdmin(admin.id);
        alert(res?.message || 'Administrator deleted successfully');
        fetchAdmins(pagination.page);
      } catch (err) {
        alert(err.message || 'Failed to delete administrator');
      }
    }
  };

  if (!isSuperAdmin) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '60px auto',
        padding: '32px',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '16px',
        textAlign: 'center',
      }}>
        <ShieldAlert size={48} style={{ color: '#DC2626', margin: '0 auto 16px' }} />
        <h2 style={{ color: '#991B1B', margin: '0 0 8px 0', fontSize: '1.4rem' }}>
          Access Restricted
        </h2>
        <p style={{ color: '#B91C1C', fontSize: '14px', margin: 0 }}>
          Admin User Management is strictly restricted to <strong>Super Admins</strong>. Your current role does not have authorization to view or manage administrative accounts.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1065', margin: 0 }}>
            Manage Administrators
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Control system access, roles, and administrative accounts
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsCreateOpen(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            backgroundColor: '#7E22CE',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
          }}
        >
          <UserPlus size={16} />
          <span>+ Add Admin User</span>
        </button>
      </div>

      {/* Success Banner if temporary password created */}
      {successInfo && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CheckCircle2 size={20} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#065F46', fontSize: '14px' }}>
                Admin Account Created Successfully!
              </strong>
              <div style={{ color: '#047857', fontSize: '13px', marginTop: '2px' }}>
                Account created for <strong>{successInfo.admin?.email}</strong> ({successInfo.admin?.role}). A welcome email with auto-generated temporary password has been dispatched.
              </div>
              {successInfo.debugTemporaryPassword && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#065F46' }}>
                  <strong>Dev Temporary Password:</strong> <code>{successInfo.debugTemporaryPassword}</code>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E9D5FF',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#FAF5FF',
            }}
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            fontSize: '13px',
            backgroundColor: '#ffffff',
            outline: 'none',
            color: '#374151',
          }}
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="EXECUTIVE">Executive</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            fontSize: '13px',
            backgroundColor: '#ffffff',
            outline: 'none',
            color: '#374151',
          }}
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>

        <button
          onClick={() => fetchAdmins(1)}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            backgroundColor: '#FAF5FF',
            border: '1px solid #E9D5FF',
            color: '#7E22CE',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Filter
        </button>
      </div>

      {/* Admins Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E9D5FF',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(107, 33, 168, 0.04)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF5FF', borderBottom: '1px solid #E9D5FF' }}>
                <th style={{ padding: '14px 18px', color: '#581C87', fontWeight: 700 }}>Administrator</th>
                <th style={{ padding: '14px 18px', color: '#581C87', fontWeight: 700 }}>Role</th>
                <th style={{ padding: '14px 18px', color: '#581C87', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '14px 18px', color: '#581C87', fontWeight: 700 }}>Last Login</th>
                <th style={{ padding: '14px 18px', color: '#581C87', fontWeight: 700 }}>Created Date</th>
                <th style={{ padding: '14px 18px', color: '#581C87', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                    Loading administrator accounts...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                    No administrators found matching criteria.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isPrimarySuperAdmin = admin.role === 'SUPER_ADMIN';

                  return (
                    <tr
                      key={admin.id}
                      style={{
                        borderBottom: '1px solid #F3E8FF',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#1E1B4B' }}>{admin.name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{admin.email}</div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor:
                            admin.role === 'SUPER_ADMIN'
                              ? '#FAF5FF'
                              : admin.role === 'MANAGER'
                              ? '#EFF6FF'
                              : '#ECFDF5',
                          color:
                            admin.role === 'SUPER_ADMIN'
                              ? '#6B21A8'
                              : admin.role === 'MANAGER'
                              ? '#1D4ED8'
                              : '#047857',
                          border: `1px solid ${
                            admin.role === 'SUPER_ADMIN'
                              ? '#D8B4FE'
                              : admin.role === 'MANAGER'
                              ? '#BFDBFE'
                              : '#A7F3D0'
                          }`,
                        }}>
                          {admin.role === 'SUPER_ADMIN'
                            ? 'Super Admin'
                            : admin.role === 'MANAGER'
                            ? 'Manager'
                            : 'Executive'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: admin.isActive ? '#047857' : '#DC2626',
                        }}>
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: admin.isActive ? '#10B981' : '#EF4444',
                          }} />
                          {admin.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td style={{ padding: '14px 18px', color: '#6B7280', fontSize: '12px' }}>
                        {admin.lastLoginAt
                          ? new Date(admin.lastLoginAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Never'}
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: '14px 18px', color: '#6B7280', fontSize: '12px' }}>
                        {new Date(admin.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {!isPrimarySuperAdmin && (
                            <>
                              <button
                                onClick={() => handleResetAccess(admin)}
                                title="Reset credentials and send new temporary password"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#FAF5FF',
                                  border: '1px solid #E9D5FF',
                                  color: '#7E22CE',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <RotateCcw size={13} />
                                <span>Reset Access</span>
                              </button>

                              <button
                                onClick={() => handleToggleStatus(admin)}
                                title={admin.isActive ? 'Deactivate account' : 'Activate account'}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: admin.isActive ? '#FEF2F2' : '#ECFDF5',
                                  border: `1px solid ${admin.isActive ? '#FECACA' : '#A7F3D0'}`,
                                  color: admin.isActive ? '#DC2626' : '#047857',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <Power size={13} />
                                <span>{admin.isActive ? 'Deactivate' : 'Activate'}</span>
                              </button>

                              <button
                                onClick={() => handleDeleteAdmin(admin)}
                                title="Permanently delete administrator"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#FEF2F2',
                                  border: '1px solid #FECACA',
                                  color: '#DC2626',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                          {isPrimarySuperAdmin && (
                            <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>
                              Primary Bootstrap
                            </span>
                          )}
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

      {/* Add Admin Modal */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#FAF5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7E22CE',
                }}>
                  <UserPlus size={20} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E1B4B', margin: 0 }}>
                  Create Administrator Account
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FAF5FF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: '#9CA3AF' }} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@thepurple.in"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FAF5FF',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Role * (Per PRD role structure)
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FAF5FF',
                    fontSize: '14px',
                    outline: 'none',
                    fontWeight: 600,
                    color: '#1E1B4B',
                  }}
                >
                  <option value="MANAGER">Manager (Catalog, Orders, Payments, Banners, Customers)</option>
                  <option value="EXECUTIVE">Executive (Upload & Edit Products, View Catalog & Orders)</option>
                </select>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '6px 0 0 0' }}>
                  Note: A secure random temporary password will be auto-generated and emailed.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#7E22CE',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {formLoading ? (
                    <BusyButtonLabel busy busyText="Creating...">Creating...</BusyButtonLabel>
                  ) : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
