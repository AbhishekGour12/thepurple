'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Package,
  ShoppingBag,
  Heart,
  Settings,
  Headphones,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function ProfileDropdown({ user, onLogout, onClose }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile Backdrop for click-outside dismissal */}
      <div
        className="profile-dropdown-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="profile-dropdown-menu"
        style={{
          position: 'absolute',
          top: 'calc(100% + 12px)',
          right: '-30px',
          width: '320px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow:
            '0 20px 45px -10px rgba(76, 29, 149, 0.18), 0 8px 16px -6px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(109, 40, 217, 0.08)',
          border: '1px solid #E8E1F5',
          overflow: 'hidden',
          zIndex: 100,
          animation: 'profileDropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          transformOrigin: 'top right',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Notch / Arrow Indicator */}
        <div
          className="profile-dropdown-notch"
          style={{
            position: 'absolute',
            top: '-6px',
            right: '52px',
            width: '12px',
            height: '12px',
            backgroundColor: '#FFFFFF',
            borderLeft: '1px solid #E8E1F5',
            borderTop: '1px solid #E8E1F5',
            transform: 'rotate(45deg)',
            zIndex: 101,
          }}
        />

        {/* ─── LOGGED IN STATE ─── */}
        {user ? (
          <>
            {/* User Header Profile Card */}
            <div
              style={{
                padding: '18px 20px',
                background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
                borderBottom: '1px solid #E8E1F5',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(user.name || user.full_name || user.phone)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#1E1B4B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.name || user.full_name || 'Valued Customer'}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      fontWeight: 500,
                      marginTop: '1px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.email || user.phone || 'Signed in'}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '6px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#EDE9FE',
                      color: '#6D28D9',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  >
                    <Sparkles size={11} />
                    <span>ThePurple Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div style={{ padding: '8px 6px' }}>
              <Link
                href="/orders"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#F5F3FF', '#6D28D9')}>
                  <Package size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>My Orders</div>
                  <div style={linkSubStyle}>Track, return & review orders</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>

              <Link
                href="/cart"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#F5F3FF', '#6D28D9')}>
                  <ShoppingBag size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>My Cart</div>
                  <div style={linkSubStyle}>View items & checkout</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>

              <Link
                href="/my-interests"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#FDF2F8', '#DB2777')}>
                  <Heart size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>My Interests & Wishlist</div>
                  <div style={linkSubStyle}>Saved items & favorites</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>

              <Link
                href="/account"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#EFF6FF', '#2563EB')}>
                  <User size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>My Profile</div>
                  <div style={linkSubStyle}>Addresses & personal info</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>

              <Link
                href="/contact"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#F0FDF4', '#16A34A')}>
                  <Headphones size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>Help & Support</div>
                  <div style={linkSubStyle}>24x7 customer assistance</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#F3F4F6', margin: '2px 0' }} />

            {/* Logout Button */}
            <div style={{ padding: '6px' }}>
              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  if (onClose) onClose();
                }}
                className="dropdown-logout-btn"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#DC2626',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626',
                    flexShrink: 0,
                  }}
                >
                  <LogOut size={16} strokeWidth={2.2} />
                </div>
                <span>Log Out</span>
              </button>
            </div>
          </>
        ) : (
          /* ─── GUEST / LOGGED OUT STATE ─── */
          <>
            {/* Welcome Header */}
            <div
              style={{
                padding: '20px 20px 16px 20px',
                background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
                borderBottom: '1px solid #E8E1F5',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#18181B' }}>
                Welcome to <span style={{ color: '#6D28D9' }}>ThePurple</span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  marginTop: '4px',
                  lineHeight: 1.4,
                }}
              >
                Sign in to manage orders, track delivery, and unlock exclusive member perks.
              </div>

              {/* Login / Sign In CTA */}
              <Link
                href="/login"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '14px',
                  width: '100%',
                  padding: '11px 16px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(109, 40, 217, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(109, 40, 217, 0.3)';
                }}
              >
                <span>Login / Sign In</span>
                <ChevronRight size={16} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Quick Links */}
            <div style={{ padding: '8px 6px' }}>
              <Link
                href="/orders"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#F5F3FF', '#6D28D9')}>
                  <Package size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>My Orders</div>
                  <div style={linkSubStyle}>Track & manage existing orders</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>

              <Link
                href="/cart"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#F5F3FF', '#6D28D9')}>
                  <ShoppingBag size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>My Cart</div>
                  <div style={linkSubStyle}>Review shopping bag</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>

              <Link
                href="/my-interests"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#FDF2F8', '#DB2777')}>
                  <Heart size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>My Interests & Wishlist</div>
                  <div style={linkSubStyle}>Items saved for later</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>

              <Link
                href="/contact"
                onClick={onClose}
                className="dropdown-link-item"
                style={linkItemStyle}
              >
                <div style={iconBoxStyle('#F0FDF4', '#16A34A')}>
                  <Headphones size={17} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={linkTitleStyle}>Help Center</div>
                  <div style={linkSubStyle}>24x7 support & answers</div>
                </div>
                <ChevronRight size={15} style={{ color: '#9CA3AF' }} />
              </Link>
            </div>
          </>
        )}

        {/* Embedded CSS for Hover & Animations */}
        <style jsx>{`
          @keyframes profileDropdownFadeIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .dropdown-link-item {
            transition: background-color 0.15s ease, transform 0.15s ease;
          }
          .dropdown-link-item:hover {
            background-color: #F8F5FE !important;
          }
          .dropdown-logout-btn:hover {
            background-color: #FEF2F2 !important;
          }
          .profile-dropdown-backdrop {
            display: none;
          }

          @media (max-width: 640px) {
            .profile-dropdown-backdrop {
              display: block !important;
              position: fixed !important;
              inset: 0 !important;
              background: rgba(15, 7, 34, 0.5) !important;
              backdrop-filter: blur(4px) !important;
              -webkit-backdrop-filter: blur(4px) !important;
              z-index: 9998 !important;
            }
            :global(.profile-dropdown-menu) {
              position: fixed !important;
              top: 66px !important;
              left: 12px !important;
              right: 12px !important;
              width: auto !important;
              max-width: 340px !important;
              margin: 0 auto !important;
              z-index: 9999 !important;
              border-radius: 20px !important;
              box-shadow: 0 20px 50px rgba(15, 7, 34, 0.35), 0 0 0 1px rgba(109, 40, 217, 0.15) !important;
              max-height: 85vh !important;
              overflow-y: auto !important;
            }
            .profile-dropdown-notch {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}

// ─── Inline Reusable Styles ──────────────────────────────────────────
const linkItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '9px 12px',
  borderRadius: '10px',
  textDecoration: 'none',
  color: '#18181B',
  cursor: 'pointer',
};

const linkTitleStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#18181B',
  lineHeight: 1.25,
};

const linkSubStyle = {
  fontSize: '11px',
  color: '#6B7280',
  fontWeight: 400,
  marginTop: '1px',
};

const iconBoxStyle = (bgColor, iconColor) => ({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: bgColor,
  color: iconColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});
