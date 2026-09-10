'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingCart, ChevronDown, Heart, Menu } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { restoreCustomerSession, logoutCustomerUser } from '@/store/slices/authSlice';
import ProfileDropdown from './ProfileDropdown';
import MobileSidebarDrawer from './MobileSidebarDrawer';

export default function MainHeader() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const customerUser = useSelector((state) => state.auth?.customer?.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const dropdownContainerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Restore customer session on initial render
  useEffect(() => {
    dispatch(restoreCustomerSession());
  }, [dispatch]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 180);
  };

  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logoutCustomerUser());
    setIsDropdownOpen(false);
  };

  // Exactly 4 navigation links as requested
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Products', href: '/products' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
  ];

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8E1F5',
        position: 'sticky',
        top: 0,
        zIndex: 45,
        boxShadow: '0 2px 10px rgba(109, 40, 217, 0.03)',
      }}
    >
      <div
        className="header-main-container"
        style={{
          maxWidth: '1420px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left Side: Mobile Menu Toggle & Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Hamburger Menu Button (Visible on screens <= 1100px) */}
          <button
            type="button"
            className="header-mobile-toggle-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open navigation sidebar"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#6D28D9',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            <Menu size={20} strokeWidth={2.2} />
          </button>

          {/* 1. Brand Logo */}
          <Link
            href="/"
            className="header-brand-logo"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                fontSize: 'clamp(1.4rem, 4.2vw, 1.95rem)',
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
                fontSize: 'clamp(1.4rem, 4.2vw, 1.95rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#6D28D9',
              }}
            >
              purple
            </span>
          </Link>
        </div>

        {/* 2. Center Navigation Links (Evenly Spaced & Space-Filling) */}
        <nav
          className="header-center-nav"
          style={{
            flex: '1',
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            padding: '0 16px',
          }}
        >
          {navLinks.map((item, idx) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

            return (
              <Link
                key={idx}
                href={item.href}
                style={{
                  fontSize: '14.5px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#6D28D9' : '#27272A',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  position: 'relative',
                  backgroundColor: isActive ? '#FAF5FF' : 'transparent',
                  transition: 'all 0.15s ease',
                  letterSpacing: '-0.01em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#6D28D9';
                    e.currentTarget.style.backgroundColor = '#FAF5FF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#27272A';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '20%',
                      right: '20%',
                      height: '2px',
                      backgroundColor: '#6D28D9',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 3. Right Action Items (Wishlist, Account & Cart) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="header-wishlist-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: '#374151',
              padding: '6px 10px',
              borderRadius: '8px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FAF5FF';
              e.currentTarget.style.color = '#7E22CE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#374151';
            }}
          >
            <Heart size={19} color="#6D28D9" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Wishlist</span>
          </Link>

          {/* Account Container with Hover + Click Dropdown (Does not redirect to login page on click) */}
          <div
            ref={dropdownContainerRef}
            style={{ position: 'relative' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={handleToggleClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleToggleClick(e);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#18181B',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '4px 6px',
                borderRadius: '8px',
                backgroundColor: isDropdownOpen ? '#FAF5FF' : 'transparent',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
              onMouseLeave={(e) => {
                if (!isDropdownOpen) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isDropdownOpen ? '#7C3AED' : '#F5F3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDropdownOpen ? '#FFFFFF' : '#4C1D95',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isDropdownOpen ? '0 3px 10px rgba(124, 58, 237, 0.3)' : 'none',
                }}
              >
                <User size={18} strokeWidth={2} />
              </div>
              <div className="header-action-text" style={{ lineHeight: 1.25 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isDropdownOpen ? '#6D28D9' : '#18181B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <span>Account</span>
                  <ChevronDown
                    size={13}
                    style={{
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: isDropdownOpen ? '#6D28D9' : '#8B8795',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#5F5A6B', fontWeight: 500 }}>
                  {customerUser ? `Hi, ${customerUser.name?.split(' ')[0] || 'Member'}` : 'Sign In / Register'}
                </div>
              </div>
            </div>

            {/* Profile Dropdown Component */}
            {isDropdownOpen && (
              <ProfileDropdown
                user={customerUser}
                onLogout={handleLogout}
                onClose={() => setIsDropdownOpen(false)}
              />
            )}
          </div>

          {/* Cart Action Button */}
          <Link
            href="/cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: '#18181B',
              padding: '6px 8px',
              borderRadius: '8px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#F5F3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4C1D95',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                <ShoppingCart size={18} strokeWidth={2} />
              </div>
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#6D28D9',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                }}
              >
                2
              </span>
            </div>
            <div className="header-action-text" style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>Cart</div>
              <div style={{ fontSize: '11px', color: '#6D28D9', fontWeight: 700 }}>₹1,299</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Slide-in Mobile Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        user={customerUser}
        onLogout={handleLogout}
      />

      <style jsx global>{`
        @media (max-width: 1150px) {
          .header-center-nav {
            display: none !important;
          }
          .header-mobile-toggle-btn {
            display: inline-flex !important;
          }
        }
        @media (max-width: 900px) {
          .header-wishlist-link {
            display: none !important;
          }
          .header-action-text {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .header-main-container {
            padding: 10px 14px !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </header>
  );
}
