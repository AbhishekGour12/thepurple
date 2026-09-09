"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Upload,
  ShoppingBag,
  CreditCard,
  Image as ImageIcon,
  Users,
  ShieldCheck,
  Settings,
  Sparkles,
  Palette,
} from 'lucide-react';

export default function AdminSidebar({ role = 'EXECUTIVE', mustChangePassword = false }) {
  const pathname = usePathname();

  // Role Permission Matrix for Sidebar Navigation
  // Super Admin: Dashboard, Products, Categories, Bulk, Orders, Payments, Banners, Users, Admin Management, Settings
  // Manager: Dashboard, Products, Categories, Bulk, Orders, Payments, Banners, Users (NO Admin Management, NO Settings)
  // Executive: Dashboard, Products, Categories (view), Orders, Users (NO Payments, NO Banners, NO Admin Management, NO Settings)

  const navItems = [
    {
      title: 'OVERVIEW',
      items: [
        {
          label: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          roles: ['SUPER_ADMIN', 'MANAGER', 'EXECUTIVE', 'WORKER'],
          exact: true,
        },
      ],
    },
    {
      title: 'PRODUCT CATALOG',
      items: [
        {
          label: 'All Products',
          href: '/admin/products',
          icon: Package,
          roles: ['SUPER_ADMIN', 'MANAGER', 'EXECUTIVE', 'WORKER'],
        },
        {
          label: 'Add Product',
          href: '/admin/products/new',
          icon: Sparkles,
          roles: ['SUPER_ADMIN', 'MANAGER', 'EXECUTIVE', 'WORKER'],
        },
        {
          label: 'Bulk Upload',
          href: '/admin/products/bulk',
          icon: Upload,
          roles: ['SUPER_ADMIN', 'MANAGER', 'EXECUTIVE', 'WORKER'],
        },
        {
          label: 'Categories',
          href: '/admin/categories',
          icon: FolderTree,
          roles: ['SUPER_ADMIN', 'MANAGER', 'EXECUTIVE', 'WORKER'],
        },
      ],
    },
    {
      title: 'BUSINESS MODULES',
      items: [
        {
          label: 'Orders',
          href: '/admin/orders',
          icon: ShoppingBag,
          roles: ['SUPER_ADMIN', 'MANAGER', 'EXECUTIVE', 'WORKER'],
        },
        {
          label: 'Payments',
          href: '/admin/payments',
          icon: CreditCard,
          roles: ['SUPER_ADMIN', 'MANAGER'], // Executive has NO ACCESS to Payments
        },
        {
          label: 'Customers / Users',
          href: '/admin/users',
          icon: Users,
          roles: ['SUPER_ADMIN', 'MANAGER', 'EXECUTIVE', 'WORKER'],
        },
        {
          label: 'Banners',
          href: '/admin/banners',
          icon: ImageIcon,
          roles: ['SUPER_ADMIN', 'MANAGER'], // Executive has NO ACCESS to Banners
        },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        {
          label: 'Manage Admins',
          href: '/admin/admins',
          icon: ShieldCheck,
          roles: ['SUPER_ADMIN'], // Super Admin ONLY
        },
        {
          label: 'Settings',
          href: '/admin/settings',
          icon: Settings,
          roles: ['SUPER_ADMIN'], // Super Admin ONLY
        },
      ],
    },
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #E9D5FF',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #FAF5FF',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 4px 10px rgba(107, 33, 168, 0.25)',
        }}>
          TP
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#2E1065',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}>
            ThePurple
          </div>
          <div style={{
            fontSize: '11px',
            color: '#7E22CE',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Admin Portal
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {navItems.map((group, groupIdx) => {
          // Filter items accessible by this role
          const visibleItems = group.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#9CA3AF',
                letterSpacing: '0.05em',
                padding: '0 12px 8px 12px',
              }}>
                {group.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: 'none',
                        color: isActive ? '#6B21A8' : '#4B5563',
                        backgroundColor: isActive ? '#FAF5FF' : 'transparent',
                        borderLeft: isActive ? '3px solid #7E22CE' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon
                        size={18}
                        style={{
                          color: isActive ? '#7E22CE' : '#6B7280',
                          flexShrink: 0,
                        }}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Must Change Password notice if applicable */}
      {mustChangePassword && (
        <div style={{
          margin: '12px',
          padding: '12px',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#92400E',
        }}>
          <strong>Action Required:</strong>
          <div style={{ marginTop: '4px' }}>Please change your temporary password.</div>
          <Link
            href="/admin/change-password"
            style={{
              display: 'inline-block',
              marginTop: '6px',
              color: '#B45309',
              fontWeight: 'bold',
              textDecoration: 'underline',
            }}
          >
            Change Password &rarr;
          </Link>
        </div>
      )}
    </aside>
  );
}
