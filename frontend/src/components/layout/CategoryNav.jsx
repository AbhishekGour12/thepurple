'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown } from 'lucide-react';

export default function CategoryNav() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Best Sellers', href: '/best-sellers' },
    { label: 'Chains', href: '/category/chains' },
    { label: 'Earrings', href: '/category/earrings' },
    { label: 'Necklaces', href: '/category/necklaces' },
    { label: 'Bangles', href: '/category/bangles' },
    { label: 'Teddy Bears', href: '/category/teddy-bears' },
    { label: 'Gifts', href: '/category/gifts' },
    { label: 'Offers', href: '/offers' },
  ];

  return (
    <nav
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F0ECF8',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1420px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          height: '50px',
          gap: '28px',
        }}
      >
        {/* All Categories Button */}
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#6D28D9',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#581C87')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6D28D9')}
        >
          <Menu size={16} strokeWidth={2.4} />
          <span>All Categories</span>
          <ChevronDown size={14} />
        </button>

        {/* Navigation Items List */}
        <div
          className="category-nav-scroll"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            flex: 1,
          }}
        >
          {navLinks.map((item, idx) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={idx}
                href={item.href}
                style={{
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#6D28D9' : '#374151',
                  textDecoration: 'none',
                  padding: '6px 2px',
                  display: 'inline-block',
                  transition: 'color 0.15s ease',
                  borderBottom: isActive ? '2px solid #6D28D9' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#6D28D9';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#374151';
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .category-nav-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}
