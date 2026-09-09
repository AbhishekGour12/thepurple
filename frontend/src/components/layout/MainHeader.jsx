'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, User, ShoppingCart, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function MainHeader() {
  const customerUser = useSelector((state) => state.auth?.customer?.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Integration point for Meilisearch / product search page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8E1F5',
        position: 'sticky',
        top: 0,
        zIndex: 45,
      }}
    >
      <div
        style={{
          maxWidth: '1420px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '28px',
        }}
      >
        {/* 1. Brand Logo */}
        <Link
          href="/"
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
              fontSize: '1.85rem',
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
              fontSize: '1.85rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#6D28D9',
            }}
          >
            purple
          </span>
        </Link>

        {/* 2. Center Large Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="header-search-form"
          style={{
            flex: '1',
            maxWidth: '660px',
            display: 'flex',
            alignItems: 'center',
            border: '1.5px solid #E8E1F5',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = '#6D28D9';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(109, 40, 217, 0.08)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = '#E8E1F5';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Category Dropdown Segment */}
          <div
            className="search-category-select"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '42px',
              backgroundColor: '#FAF8FC',
              borderRight: '1px solid #E8E1F5',
              fontSize: '13px',
              color: '#5F5A6B',
              fontWeight: 500,
              cursor: 'pointer',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            <span>{selectedCategory}</span>
            <ChevronDown size={14} style={{ color: '#8B8795' }} />
          </div>

          {/* Search Input Field */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for chains, earrings, bangles, teddy bears..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '0 16px',
              fontSize: '13.5px',
              color: '#18181B',
              fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
              backgroundColor: 'transparent',
              height: '42px',
            }}
          />

          {/* Search Button */}
          <button
            type="submit"
            aria-label="Search"
            style={{
              width: '44px',
              height: '42px',
              backgroundColor: '#6D28D9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#581C87')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6D28D9')}
          >
            <Search size={18} strokeWidth={2.2} />
          </button>
        </form>

        {/* 3. Right Action Items (Account & Cart) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
          {/* Account */}
          <Link
            href={customerUser ? '/account' : '/login'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#18181B',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#F5F3FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4C1D95',
                flexShrink: 0,
              }}
            >
              <User size={20} strokeWidth={1.8} />
            </div>
            <div className="header-action-text" style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>
                Account
              </div>
              <div style={{ fontSize: '11px', color: '#5F5A6B', fontWeight: 500 }}>
                {customerUser ? customerUser.name || 'My Profile' : 'Sign In / Register'}
              </div>
            </div>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#18181B',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#F5F3FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4C1D95',
                flexShrink: 0,
              }}
            >
              <ShoppingCart size={20} strokeWidth={1.8} />
              {/* Notification Badge */}
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#6D28D9',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 1px 3px rgba(109, 40, 217, 0.3)',
                }}
              >
                2
              </span>
            </div>
            <div className="header-action-text" style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>
                Cart
              </div>
              <div style={{ fontSize: '12px', color: '#6D28D9', fontWeight: 700 }}>
                ₹1,299
              </div>
            </div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .search-category-select {
            display: none !important;
          }
          .header-action-text {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .header-search-form {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
