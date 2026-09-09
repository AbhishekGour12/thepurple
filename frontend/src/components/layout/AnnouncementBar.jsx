'use client';

import Link from 'next/link';
import { Truck, MapPin, Heart, Headphones } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div
      style={{
        backgroundColor: '#4C1D95',
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: 500,
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1420px',
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Announcement Message */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={15} style={{ color: '#DDD6FE', flexShrink: 0 }} />
          <span>Free Shipping on Orders Above ₹999 | COD Available</span>
        </div>

        {/* Right Utility Navigation */}
        <div className="announcement-right-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            href="/track-order"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <MapPin size={13} style={{ color: '#DDD6FE' }} />
            <span>Track Order</span>
          </Link>

          <Link
            href="/wishlist"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Heart size={13} style={{ color: '#DDD6FE' }} />
            <span>Wishlist</span>
          </Link>

          <Link
            href="/support"
            style={{
              color: '#FFFFFF',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Headphones size={13} style={{ color: '#DDD6FE' }} />
            <span>Support</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .announcement-right-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
