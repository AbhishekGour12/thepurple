"use client";

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { LogOut, KeyRound, User } from 'lucide-react';
import { logoutAdminUser } from '@/store/slices/authSlice';
import Link from 'next/link';

export default function AdminHeader({ admin }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutAdminUser());
    router.replace('/admin/login');
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
    <header style={{
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
    }}>
      {/* Search / Breadcrumb / Status placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#6B7280',
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 6px #10B981',
          }} />
          <span>ThePurple Live System</span>
        </div>
      </div>

      {/* Admin Profile & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Role Badge */}
        <span style={{
          backgroundColor: badge.bg,
          color: badge.text,
          border: `1px solid ${badge.border}`,
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.03em',
        }}>
          {badge.label}
        </span>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#FAF5FF',
            border: '1px solid #E9D5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7E22CE',
          }}>
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
  );
}
