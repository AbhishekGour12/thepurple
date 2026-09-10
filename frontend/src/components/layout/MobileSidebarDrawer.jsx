'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Home,
  ShoppingBag,
  Sparkles,
  Flame,
  Tag,
  Info,
  Phone,
  Package,
  Heart,
  User,
  LogOut,
  ChevronRight,
  Compass,
  ArrowRight,
} from 'lucide-react';

export default function MobileSidebarDrawer({ isOpen, onClose, user, onLogout }) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navMenuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'All Products', href: '/products', icon: ShoppingBag, badge: 'Catalog' },
    { label: 'New Arrivals', href: '/new-arrivals', icon: Sparkles, badge: 'New', badgeColor: '#EC4899' },
    { label: 'Best Sellers', href: '/best-sellers', icon: Flame, badge: 'Hot', badgeColor: '#EF4444' },
    { label: 'Offers & Deals', href: '/offers', icon: Tag, badge: 'Deals', badgeColor: '#10B981' },
    { label: 'About Us', href: '/about', icon: Info },
    { label: 'Contact Us', href: '/contact', icon: Phone },
  ];

  const userActionItems = [
    { label: 'My Orders', href: '/orders', icon: Package, desc: 'Track & manage orders' },
    { label: 'My Wishlist', href: '/wishlist', icon: Heart, desc: 'Saved favorite items' },
    { label: 'My Cart', href: '/cart', icon: ShoppingBag, desc: 'View cart & checkout' },
    { label: 'Track Order', href: '/track-order', icon: Compass, desc: 'Realtime order status' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
      }}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 7, 34, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'sidebarBackdropFade 0.2s ease-out forwards',
        }}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '85%',
          maxWidth: '350px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 25px 60px rgba(15, 7, 34, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100000,
          overflowY: 'auto',
          animation: 'sidebarSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F3E8FF',
            background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Link
            href="/"
            onClick={onClose}
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                fontSize: '1.65rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#18181B',
              }}
            >
              the
            </span>
            <span
              style={{
                fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                fontSize: '1.65rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#6D28D9',
              }}
            >
              purple
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#6D28D9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* User Card */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3E8FF', backgroundColor: '#FCFBFE' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {getInitials(user.name || user.full_name || user.phone)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: '#1E1B4B',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name || user.full_name || 'Valued Member'}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    marginTop: '1px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.email || user.phone || 'Signed in'}
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: '#EDE9FE',
                    color: '#6D28D9',
                    fontSize: '10.5px',
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={10} />
                  <span>ThePurple Member</span>
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#18181B' }}>
                Welcome to <span style={{ color: '#6D28D9' }}>ThePurple</span>
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '3px 0 12px', lineHeight: 1.4 }}>
                Sign in to track orders, manage addresses & get member discounts.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href="/login"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>Login</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #E9D5FF',
                    color: '#6D28D9',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>Register</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div style={{ padding: '14px 12px', flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#9333EA',
              padding: '0 8px 8px',
            }}
          >
            Explore Store
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navMenuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? '#FAF5FF' : 'transparent',
                    border: isActive ? '1px solid #E9D5FF' : '1px solid transparent',
                    color: isActive ? '#6D28D9' : '#18181B',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#EDE9FE' : '#FAF5FF',
                        color: isActive ? '#6D28D9' : '#7E22CE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={17} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 600 }}>
                      {item.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          backgroundColor: item.badgeColor ? item.badgeColor + '15' : '#FAF5FF',
                          color: item.badgeColor || '#7E22CE',
                          border: '1px solid ' + (item.badgeColor ? item.badgeColor + '30' : '#E9D5FF'),
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={16} color={isActive ? '#6D28D9' : '#9CA3AF'} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Account Actions */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#9333EA',
              padding: '18px 8px 8px',
            }}
          >
            My Account &amp; Bag
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {userActionItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#18181B',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#F5F3FF',
                        color: '#6D28D9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181B' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={15} color="#9CA3AF" />
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          {user && (
            <button
              type="button"
              onClick={() => {
                if (onLogout) onLogout();
                onClose();
              }}
              style={{
                marginTop: '14px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Log Out of Account</span>
            </button>
          )}
        </div>

        {/* Customer Support Footer */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid #F3E8FF',
            backgroundColor: '#FAF5FF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#18181B' }}>
              Need Help?
            </div>
            <div style={{ fontSize: '11px', color: '#6D28D9', fontWeight: 600 }}>
              Mon – Sat, 10 AM – 7 PM
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#6D28D9',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span>💬 WhatsApp</span>
            </a>
            <a
              href="tel:+919876543210"
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E9D5FF',
                color: '#6D28D9',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Phone size={12} />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
