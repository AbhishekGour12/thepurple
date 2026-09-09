'use client';

import { Sparkles, Search, ShoppingBag, ShieldCheck } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';

export default function Header({ apiStatus = 'healthy' }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--purple-200)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
          gap: '24px',
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--purple-800) 0%, var(--purple-600) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(126, 34, 206, 0.3)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--purple-900)',
                letterSpacing: '-0.03em',
              }}
            >
              ThePurple
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--purple-600)',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              E-Commerce Platform
            </span>
          </div>
        </div>

        {/* Search Bar Placeholder (Prepared for Day 4-6 Search Intent) */}
        <div
          style={{
            flex: '1',
            maxWidth: '520px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              color: 'var(--purple-400)',
            }}
          />
          <input
            type="text"
            placeholder="Search jewellery, apparel, gold chains... (Search Intent Foundation ready)"
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              borderRadius: '9999px',
              border: '1px solid var(--purple-200)',
              backgroundColor: 'white',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            readOnly
          />
        </div>

        {/* Header Right: API Status & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Backend API:
            </span>
            <StatusBadge status={apiStatus} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--purple-50)',
              border: '1px solid var(--purple-200)',
              fontSize: '0.82rem',
              color: 'var(--purple-800)',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={16} color="var(--purple-600)" />
            Day 1 Architecture
          </div>
        </div>
      </div>
    </header>
  );
}
