"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BrandHeader() {
  return (
    <header
      className="login-brand-header"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 52px',
        gap: '12px',
      }}
    >
      {/* Brand Logo */}
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
            fontSize: 'clamp(1.4rem, 4.5vw, 1.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--primary-text, #18181B)',
          }}
        >
          the
        </span>
        <span
          style={{
            fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
            fontSize: 'clamp(1.4rem, 4.5vw, 1.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--primary-purple, #6D28D9)',
          }}
        >
          purple
        </span>
      </Link>

      {/* Guest Navigation */}
      <div
        className="login-guest-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '13px',
          fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
          flexShrink: 0,
        }}
      >
        <span className="guest-prefix" style={{ color: 'var(--secondary-text, #5F5A6B)', fontWeight: 500 }}>
          New here?
        </span>
        <Link
          href="/"
          style={{
            color: 'var(--primary-purple, #6D28D9)',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <span>Explore as Guest</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .login-brand-header {
            padding: 16px 18px !important;
          }
          .guest-prefix {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
