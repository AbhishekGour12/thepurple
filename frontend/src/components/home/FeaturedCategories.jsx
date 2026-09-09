'use client';

import Link from 'next/link';
import HorizontalCarousel from './HorizontalCarousel';

const CATEGORIES = [
  {
    id: 'chains',
    name: 'Chains & Links',
    count: '48+ Designs',
    image: '/images/storefront/cat-chains.jpg',
    href: '/category/chains',
    tag: 'Trending',
  },
  {
    id: 'necklaces',
    name: 'Royal Necklaces',
    count: '36+ Designs',
    image: '/images/storefront/cat-necklaces.jpg',
    href: '/category/necklaces',
    tag: 'Popular',
  },
  {
    id: 'earrings',
    name: 'Earrings & Drops',
    count: '54+ Designs',
    image: '/images/storefront/cat-earrings.jpg',
    href: '/category/earrings',
    tag: 'New',
  },
  {
    id: 'bangles',
    name: 'Bangles & Cuffs',
    count: '28+ Designs',
    image: '/images/storefront/cat-bangles.jpg',
    href: '/category/bangles',
    tag: '18K Gold',
  },
  {
    id: 'rings',
    name: 'Solitaire Rings',
    count: '42+ Designs',
    image: '/images/storefront/cat-rings.jpg',
    href: '/category/rings',
    tag: 'Sparkling',
  },
  {
    id: 'teddy-gifts',
    name: 'Teddy & Gift Sets',
    count: '24+ Combos',
    image: '/images/storefront/cat-teddy.jpg',
    href: '/category/gifts',
    tag: 'Special',
  },
  {
    id: 'pendants',
    name: 'Sparkling Pendants',
    count: '38+ Designs',
    image: '/images/storefront/prod-heart-pendant.jpg',
    href: '/category/necklaces',
    tag: 'Hot Pick',
  },
  {
    id: 'bracelets',
    name: 'Luxury Bracelets',
    count: '31+ Designs',
    image: '/images/storefront/prod-rose-bangle.jpg',
    href: '/category/bangles',
    tag: 'Exclusive',
  },
];

export default function FeaturedCategories() {
  return (
    <section
      style={{
        maxWidth: '1420px',
        margin: '36px auto 0 auto',
        padding: '0 16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.16em',
              color: '#7C3AED',
              textTransform: 'uppercase',
              marginBottom: '4px',
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
            }}
          >
            CURATED SELECTION
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              fontSize: 'clamp(1.15rem, 3vw, 1.45rem)',
              fontWeight: 800,
              color: '#18181B',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Shop By Category
          </h2>
        </div>

        <Link
          href="/shop"
          style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#6D28D9',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          View All →
        </Link>
      </div>

      <HorizontalCarousel gap={16}>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="category-slide-card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '16px 12px 18px',
              border: '1px solid #ECE6F6',
              boxShadow: '0 2px 8px rgba(109, 40, 217, 0.04)',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(109, 40, 217, 0.08)',
                color: '#6D28D9',
                fontSize: '9.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                letterSpacing: '0.02em',
              }}
            >
              {cat.tag}
            </span>

            <div
              className="cat-img-wrapper"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '8px auto 12px',
                border: '2.5px solid #F3ECFF',
                boxShadow: '0 4px 12px rgba(109, 40, 217, 0.08)',
                flexShrink: 0,
              }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.35s ease',
                }}
              />
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#18181B',
                textAlign: 'center',
                marginBottom: '3px',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                lineHeight: 1.25,
              }}
            >
              {cat.name}
            </div>
            <div style={{ fontSize: '11px', color: '#8B8795', textAlign: 'center', fontWeight: 500 }}>
              {cat.count}
            </div>
          </Link>
        ))}
      </HorizontalCarousel>

      <style jsx>{`
        :global(.category-slide-card) {
          flex: 0 0 calc((100% - 5 * 16px) / 6) !important;
          min-width: 180px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        :global(.category-slide-card:hover) {
          transform: translateY(-4px);
          border-color: #C4B5FD !important;
          box-shadow: 0 12px 26px rgba(109, 40, 217, 0.12) !important;
        }
        :global(.category-slide-card:hover img) {
          transform: scale(1.08);
        }
        @media (max-width: 1200px) {
          :global(.category-slide-card) {
            flex: 0 0 calc((100% - 4 * 14px) / 5) !important;
            min-width: 165px;
          }
        }
        @media (max-width: 992px) {
          :global(.category-slide-card) {
            flex: 0 0 calc((100% - 3 * 12px) / 4) !important;
            min-width: 150px;
          }
        }
        @media (max-width: 768px) {
          :global(.category-slide-card) {
            flex: 0 0 calc((100% - 2 * 12px) / 3.2) !important;
            min-width: 135px;
            padding: 12px 8px 14px !important;
          }
          :global(.cat-img-wrapper) {
            width: 82px !important;
            height: 82px !important;
          }
        }
        @media (max-width: 520px) {
          :global(.category-slide-card) {
            flex: 0 0 calc((100% - 10px) / 2.35) !important;
            min-width: 124px;
            padding: 10px 6px 12px !important;
          }
          :global(.cat-img-wrapper) {
            width: 74px !important;
            height: 74px !important;
          }
        }
      `}</style>
    </section>
  );
}
