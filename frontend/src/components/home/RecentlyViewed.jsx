'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Check, Eye } from 'lucide-react';
import HorizontalCarousel from './HorizontalCarousel';

const CATALOGUE_PRODUCTS = [
  {
    id: 'prod-1',
    name: '22K Handcrafted Golden Rope Chain',
    category: 'Chains',
    price: 899,
    originalPrice: 1499,
    rating: 5,
    reviews: 148,
    badge: 'Bestseller',
    badgeColor: '#6D28D9',
    image: '/images/storefront/prod-gold-rope.jpg',
    slug: 'golden-rope-chain',
  },
  {
    id: 'prod-2',
    name: 'Sparkling Solitaire Diamond Ring',
    category: 'Rings',
    price: 2499,
    originalPrice: 3999,
    rating: 5,
    reviews: 94,
    badge: 'Exclusive',
    badgeColor: '#059669',
    image: '/images/storefront/prod-diamond-ring.jpg',
    slug: 'solitaire-diamond-ring',
  },
  {
    id: 'prod-3',
    name: 'Lustrous Freshwater Pearl Drop Necklace',
    category: 'Necklaces',
    price: 1899,
    originalPrice: 2899,
    rating: 5,
    reviews: 82,
    badge: 'Trending',
    badgeColor: '#DB2777',
    image: '/images/storefront/prod-pearl-necklace.jpg',
    slug: 'pearl-drop-necklace',
  },
  {
    id: 'prod-4',
    name: 'Emerald & Gold Chandelier Drop Earrings',
    category: 'Earrings',
    price: 1299,
    originalPrice: 1999,
    rating: 5,
    reviews: 67,
    badge: 'New Arrival',
    badgeColor: '#D97706',
    image: '/images/storefront/prod-emerald-earrings.jpg',
    slug: 'emerald-gold-chandelier-earrings',
  },
  {
    id: 'prod-5',
    name: 'Solid Italian Cuban Link Gold Chain',
    category: 'Chains',
    price: 1499,
    originalPrice: 2299,
    rating: 5,
    reviews: 112,
    badge: 'Popular',
    badgeColor: '#7C3AED',
    image: '/images/storefront/prod-cuban-chain.jpg',
    slug: 'italian-cuban-link-chain',
  },
  {
    id: 'prod-6',
    name: 'Luxury Velvet Teddy Bear & Hamper',
    category: 'Gifts & Hampers',
    price: 1799,
    originalPrice: 2799,
    rating: 5,
    reviews: 135,
    badge: 'Gift Choice',
    badgeColor: '#E11D48',
    image: '/images/storefront/prod-teddy-gift.jpg',
    slug: 'teddy-bear-heart-pendant-hamper',
  },
  {
    id: 'prod-7',
    name: 'Diamond Studded 18K Rose Gold Bangle',
    category: 'Bangles',
    price: 2199,
    originalPrice: 3499,
    rating: 5,
    reviews: 58,
    badge: '18K Gold',
    badgeColor: '#9D174D',
    image: '/images/storefront/prod-rose-bangle.jpg',
    slug: 'rose-gold-diamond-bangle',
  },
  {
    id: 'prod-8',
    name: 'Crystal Heart Solitaire Gold Pendant',
    category: 'Necklaces',
    price: 999,
    originalPrice: 1699,
    rating: 5,
    reviews: 93,
    badge: 'Hot Deal',
    badgeColor: '#DC2626',
    image: '/images/storefront/prod-heart-pendant.jpg',
    slug: 'crystal-heart-solitaire-pendant',
  },
  {
    id: 'prod-9',
    name: 'Classic Solitaire Diamond Stud Earrings',
    category: 'Earrings',
    price: 1099,
    originalPrice: 1799,
    rating: 5,
    reviews: 89,
    badge: 'Must Have',
    badgeColor: '#4F46E5',
    image: '/images/storefront/prod-gold-studs.jpg',
    slug: 'solitaire-diamond-studs',
  },
  {
    id: 'prod-10',
    name: 'Multi-Layered Elegant 18K Gold Chain',
    category: 'Chains',
    price: 1199,
    originalPrice: 1899,
    rating: 5,
    reviews: 71,
    badge: 'Trending',
    badgeColor: '#7C3AED',
    image: '/images/storefront/prod-layered-chain.jpg',
    slug: 'multi-layered-gold-chain',
  },
];

export default function RecentlyViewed() {
  const [viewedProducts, setViewedProducts] = useState([]);
  const [wishlist, setWishlist] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('thepurple_recently_viewed');
      let ids = [];
      if (stored) {
        ids = JSON.parse(stored);
      } else {
        ids = ['prod-7', 'prod-2', 'prod-1', 'prod-3', 'prod-6', 'prod-4', 'prod-5', 'prod-8', 'prod-9', 'prod-10'];
        localStorage.setItem('thepurple_recently_viewed', JSON.stringify(ids));
      }

      const mapped = [];
      const seen = new Set();
      ids.forEach((id) => {
        if (!seen.has(id)) {
          seen.add(id);
          const item = CATALOGUE_PRODUCTS.find((p) => p.id === id || p.slug === id);
          if (item) mapped.push(item);
        }
      });

      // Ensure we have a generous list of products for the slider
      if (mapped.length < 5) {
        CATALOGUE_PRODUCTS.forEach((p) => {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            mapped.push(p);
          }
        });
      }

      setViewedProducts(mapped);
    } catch {
      setViewedProducts(CATALOGUE_PRODUCTS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const money = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToCart((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedToCart((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  if (isLoaded && viewedProducts.length === 0) return null;

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
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Eye size={14} />
            <span>RECENTLY VIEWED</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              fontSize: 'clamp(1.15rem, 3vw, 1.45rem)',
              fontWeight: 800,
              color: '#18181B',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Continue Exploring Your Favorites
          </h2>
          <p style={{ fontSize: '13px', color: '#5F5A6B', margin: 0 }}>
            Continue exploring products you viewed recently
          </p>
        </div>

        <Link href="/shop" style={{ fontSize: '12.5px', fontWeight: 700, color: '#6D28D9', textDecoration: 'none' }}>
          View All →
        </Link>
      </div>

      <HorizontalCarousel gap={16}>
        {viewedProducts.map((prod) => {
          const isLiked = !!wishlist[prod.id];
          const isAdded = !!addedToCart[prod.id];
          const discountPct = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);

          return (
            <div
              key={prod.id}
              className="fav-slide-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE6F6',
                borderRadius: '14px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(109, 40, 217, 0.04)',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  right: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  zIndex: 3,
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    backgroundColor: prod.badgeColor,
                    color: '#FFFFFF',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {prod.badge}
                </span>
                <button
                  type="button"
                  aria-label="Wishlist"
                  onClick={(e) => toggleWishlist(e, prod.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #E8E1F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isLiked ? '#E11D48' : '#6B7280',
                    pointerEvents: 'auto',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <Heart size={14} fill={isLiked ? '#E11D48' : 'none'} stroke={isLiked ? '#E11D48' : 'currentColor'} />
                </button>
              </div>

              <Link
                href={`/product/${prod.slug}`}
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '1 / 1.08',
                  backgroundColor: '#FAF7F5',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                  position: 'relative',
                }}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="fav-img-hover"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.35s ease',
                  }}
                />
              </Link>

              <div style={{ fontSize: '10px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', marginBottom: '2px' }}>
                {prod.category}
              </div>
              <Link
                href={`/product/${prod.slug}`}
                style={{
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#18181B',
                  lineHeight: 1.3,
                  marginBottom: '6px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '32px',
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                {prod.name}
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                {[...Array(prod.rating)].map((_, i) => (
                  <Star key={i} size={11} fill="#F59E0B" stroke="#F59E0B" />
                ))}
                <span style={{ fontSize: '10.5px', color: '#8B8795', fontWeight: 600 }}>({prod.reviews})</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#18181B' }}>{money(prod.price)}</span>
                <span style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through' }}>{money(prod.originalPrice)}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669' }}>{discountPct}% OFF</span>
              </div>

              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, prod.id)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  backgroundColor: isAdded ? '#059669' : '#F5F3FF',
                  color: isAdded ? '#FFFFFF' : '#6D28D9',
                  border: isAdded ? '1px solid #059669' : '1px solid #E9DBFF',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  marginTop: 'auto',
                  transition: 'all 0.2s ease',
                }}
              >
                {isAdded ? (
                  <>
                    <Check size={13} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={13} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </HorizontalCarousel>

      <style jsx>{`
        :global(.fav-slide-card) {
          flex: 0 0 calc((100% - 4 * 16px) / 5) !important;
          min-width: 220px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        :global(.fav-slide-card:hover) {
          transform: translateY(-4px);
          border-color: #C4B5FD !important;
          box-shadow: 0 12px 28px rgba(109, 40, 217, 0.12) !important;
        }
        :global(.fav-slide-card:hover .fav-img-hover) {
          transform: scale(1.08);
        }
        @media (max-width: 1200px) {
          :global(.fav-slide-card) {
            flex: 0 0 calc((100% - 3 * 14px) / 4) !important;
            min-width: 200px;
          }
        }
        @media (max-width: 992px) {
          :global(.fav-slide-card) {
            flex: 0 0 calc((100% - 2 * 12px) / 3) !important;
            min-width: 180px;
          }
        }
        @media (max-width: 768px) {
          :global(.fav-slide-card) {
            flex: 0 0 calc((100% - 10px) / 2.25) !important;
            min-width: 155px;
          }
        }
        @media (max-width: 480px) {
          :global(.fav-slide-card) {
            flex: 0 0 calc((100% - 8px) / 2.05) !important;
            min-width: 145px;
            padding: 8px !important;
          }
        }
      `}</style>
    </section>
  );
}
