'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Heart,
  ShoppingCart,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const FALLBACK_10_FEATURED = [
  {
    id: 'prod-1',
    name: '22K Handcrafted Golden Rope Chain',
    category: 'Chains',
    price: 899,
    originalPrice: 1499,
    discount: 40,
    rating: 4.8,
    reviews: 148,
    badge: 'BESTSELLER',
    badgeColor: '#6D28D9',
    image: '/images/storefront/prod-gold-rope.jpg',
    slug: 'golden-rope-chain',
  },
  {
    id: 'prod-2',
    name: 'Crystal Drop Earrings',
    category: 'Earrings',
    price: 699,
    originalPrice: 1199,
    discount: 42,
    rating: 4.9,
    reviews: 96,
    badge: 'NEW',
    badgeColor: '#4338CA',
    image: '/images/storefront/cat-earrings.jpg',
    slug: 'crystal-drop-earrings',
  },
  {
    id: 'prod-3',
    name: 'Minimal Butterfly Necklace',
    category: 'Necklaces',
    price: 749,
    originalPrice: 1199,
    discount: 38,
    rating: 4.7,
    reviews: 53,
    badge: 'TRENDING',
    badgeColor: '#DB2777',
    image: '/images/storefront/prod-heart-pendant.jpg',
    slug: 'minimal-butterfly-necklace',
  },
  {
    id: 'prod-4',
    name: 'Elegant Pearl Bangles',
    category: 'Bangles',
    price: 999,
    originalPrice: 1699,
    discount: 41,
    rating: 4.8,
    reviews: 88,
    badge: 'EXCLUSIVE',
    badgeColor: '#059669',
    image: '/images/storefront/cat-bangles.jpg',
    slug: 'elegant-pearl-bangles',
  },
  {
    id: 'prod-5',
    name: 'Sparkling Solitaire Diamond Ring',
    category: 'Rings',
    price: 2499,
    originalPrice: 3999,
    discount: 38,
    rating: 4.9,
    reviews: 124,
    badge: 'HOT DEAL',
    badgeColor: '#DC2626',
    image: '/images/storefront/prod-diamond-ring.jpg',
    slug: 'sparkling-solitaire-diamond-ring',
  },
  {
    id: 'prod-6',
    name: 'Cute Purple Teddy Bear',
    category: 'Teddy Bears',
    price: 599,
    originalPrice: 999,
    discount: 40,
    rating: 4.9,
    reviews: 68,
    badge: 'POPULAR',
    badgeColor: '#7E22CE',
    image: '/images/storefront/cat-teddy.jpg',
    slug: 'cute-purple-teddy-bear',
  },
  {
    id: 'prod-7',
    name: 'Luxury Rose Gold Watch & Bracelet Set',
    category: 'Gifts & Hampers',
    price: 1899,
    originalPrice: 2999,
    discount: 37,
    rating: 4.8,
    reviews: 79,
    badge: 'SPECIAL',
    badgeColor: '#BE185D',
    image: '/images/storefront/hero-rosegold.jpg',
    slug: 'luxury-rosegold-watch-set',
  },
  {
    id: 'prod-8',
    name: 'Traditional Royal Polki Jhumkas',
    category: 'Earrings',
    price: 1299,
    originalPrice: 2199,
    discount: 41,
    rating: 4.9,
    reviews: 112,
    badge: 'FEATURED',
    badgeColor: '#6D28D9',
    image: '/images/storefront/cat-earrings.jpg',
    slug: 'traditional-royal-polki-jhumkas',
  },
  {
    id: 'prod-9',
    name: 'Emerald Sparkle Choker Necklace',
    category: 'Necklaces',
    price: 1599,
    originalPrice: 2599,
    discount: 38,
    rating: 4.8,
    reviews: 64,
    badge: 'LIMITED',
    badgeColor: '#047857',
    image: '/images/storefront/cat-necklaces.jpg',
    slug: 'emerald-sparkle-choker',
  },
  {
    id: 'prod-10',
    name: 'Premium Velvet Romance Hamper',
    category: 'Gifts & Hampers',
    price: 1999,
    originalPrice: 3499,
    discount: 43,
    rating: 4.9,
    reviews: 84,
    badge: 'HOT DEAL',
    badgeColor: '#DC2626',
    image: '/images/storefront/hero-gifts.jpg',
    slug: 'premium-velvet-romance-hamper',
  },
];

export default function HomeFeaturedProducts() {
  const [products, setProducts] = useState(FALLBACK_10_FEATURED);
  const [wishlist, setWishlist] = useState({});
  const [cartState, setCartState] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/products?limit=10&isFeatured=true`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.products) && json.data.products.length > 0 && isMounted) {
          const transformed = json.data.products.slice(0, 10).map((p) => {
            const primaryImg =
              p.images?.find((img) => img.isPrimary)?.url ||
              p.images?.[0]?.url ||
              '/images/storefront/prod-gold-rope.jpg';
            const catName = p.subcategory?.category?.name || 'Jewellery';
            const mrp = p.mrp || p.originalPrice || Math.round(Number(p.price) * 1.5);
            const discount = p.discountPercent || (mrp > p.price ? Math.round(((mrp - p.price) / mrp) * 100) : 0);

            return {
              id: p.id,
              name: p.name,
              category: catName,
              price: Number(p.price),
              originalPrice: mrp,
              discount,
              rating: Number(p.rating || 4.8),
              reviews: p.reviewCount || 42,
              badge: p.isFeatured ? 'FEATURED' : p.isBestSeller ? 'BESTSELLER' : discount > 30 ? `${discount}% OFF` : 'POPULAR',
              badgeColor: p.isBestSeller ? '#6D28D9' : '#DB2777',
              image: primaryImg,
              slug: p.slug || p.id,
            };
          });
          setProducts(transformed);
        }
      } catch {
        // Keeps fallback
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setCartState((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCartState((prev) => ({ ...prev, [id]: false }));
    }, 1800);
  };

  return (
    <section
      style={{
        padding: '50px 24px 60px',
        maxWidth: '1380px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '36px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: '#FAF5FF',
            border: '1px solid #E9D5FF',
            color: '#7E22CE',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
          }}
        >
          <Sparkles size={14} color="#7E22CE" />
          <span>🔥 Hot & Trending Now</span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(24px, 3.5vw, 34px)',
            fontWeight: 800,
            color: '#1E1B4B',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
          }}
        >
          Trending Products
        </h2>

        <p
          style={{
            fontSize: '14.5px',
            color: '#6B7280',
            maxWidth: '620px',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Discover our most coveted fine jewellery pieces, romantic gift hampers, and artisanal creations made for your royal moments.
        </p>
      </div>

      {/* 10 Products Grid */}
      <div
        className="home-featured-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {products.map((prod) => {
          const isWish = !!wishlist[prod.id];
          const isAdded = !!cartState[prod.id];

          return (
            <div
              key={prod.id}
              className="home-product-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #F3E8FF',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(126, 34, 206, 0.04)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
              }}
            >
              {/* Image & Badges Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  backgroundColor: '#FAF5FF',
                  overflow: 'hidden',
                }}
              >
                <Link href={`/products/${prod.slug || prod.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="home-prod-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    onError={(e) => {
                      e.target.src = '/images/storefront/prod-gold-rope.jpg';
                    }}
                  />
                </Link>

                {/* Badge */}
                {prod.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: prod.badgeColor || '#6D28D9',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    {prod.badge}
                  </span>
                )}

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(e, prod.id)}
                  aria-label="Add to wishlist"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #E9D5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Heart
                    size={15}
                    color={isWish ? '#DC2626' : '#6B7280'}
                    fill={isWish ? '#DC2626' : 'none'}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div
                style={{
                  padding: '14px 14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Category Tag */}
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#9333EA',
                      letterSpacing: '0.04em',
                      marginBottom: '4px',
                    }}
                  >
                    {prod.category}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/products/${prod.slug || prod.id}`}
                    style={{
                      textDecoration: 'none',
                      color: '#1E1B4B',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        margin: '0 0 6px',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '36px',
                      }}
                    >
                      {prod.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        backgroundColor: '#FEF3C7',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      <Star size={11} color="#D97706" fill="#D97706" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E' }}>
                        {prod.rating}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      ({prod.reviews})
                    </span>
                  </div>
                </div>

                <div>
                  {/* Price Block */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '6px',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#1E1B4B',
                      }}
                    >
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                    {prod.originalPrice > prod.price && (
                      <>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#9CA3AF',
                            textDecoration: 'line-through',
                          }}
                        >
                          ₹{prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#16A34A',
                          }}
                        >
                          {prod.discount}% off
                        </span>
                      </>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, prod.id)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: isAdded ? '#059669' : '#6D28D9',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isAdded
                        ? '0 3px 8px rgba(5, 150, 105, 0.3)'
                        : '0 3px 8px rgba(109, 40, 217, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isAdded) e.currentTarget.style.backgroundColor = '#581C87';
                    }}
                    onMouseLeave={(e) => {
                      if (!isAdded) e.currentTarget.style.backgroundColor = '#6D28D9';
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={14} />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prominent "View All Products" CTA Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Link
          href="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 32px',
            borderRadius: '50px',
            backgroundColor: '#1E1B4B',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(30, 27, 75, 0.2)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6D28D9';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(109, 40, 217, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1E1B4B';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 27, 75, 0.2)';
          }}
        >
          <span>View All Products</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      <style jsx global>{`
        :global(.home-product-card:hover) {
          transform: translateY(-4px);
          border-color: #C084FC !important;
          box-shadow: 0 12px 24px rgba(126, 34, 206, 0.12) !important;
        }
        :global(.home-product-card:hover .home-prod-img) {
          transform: scale(1.06);
        }
        @media (max-width: 1200px) {
          .home-featured-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          .home-featured-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .home-featured-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}
