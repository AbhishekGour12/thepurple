'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Grid } from 'lucide-react';

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Chains', slug: 'chains', imageUrl: '/images/storefront/cat-chains.jpg', count: '48+ Designs' },
  { id: '2', name: 'Earrings', slug: 'earrings', imageUrl: '/images/storefront/cat-earrings.jpg', count: '36+ Designs' },
  { id: '3', name: 'Necklaces', slug: 'necklaces', imageUrl: '/images/storefront/cat-necklaces.jpg', count: '54+ Designs' },
  { id: '4', name: 'Bangles', slug: 'bangles', imageUrl: '/images/storefront/cat-bangles.jpg', count: '28+ Designs' },
  { id: '5', name: 'Rings', slug: 'rings', imageUrl: '/images/storefront/cat-rings.jpg', count: '42+ Designs' },
  { id: '6', name: 'Teddy Bears', slug: 'teddy-bears', imageUrl: '/images/storefront/cat-teddy.jpg', count: '24+ Combos' },
  { id: '7', name: 'Gifts & Hampers', slug: 'gifts', imageUrl: '/images/storefront/hero-gifts.jpg', count: '36+ Options' },
];

export default function ProductsCategoryBar({
  categories = [],
  selectedCategory = null,
  onSelectCategory,
  onOpenAllCategoriesModal,
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayList = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [displayList]);

  const scrollBy = (offset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    const catalogEl = document.getElementById('catalog-products-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      style={{
        maxWidth: '1420px',
        margin: '28px auto 8px auto',
        padding: '0 20px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '18px',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#18181B',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
            }}
          >
            Shop By Category
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#6B7280' }}>
            Click any collection to filter catalog instantly
          </p>
        </div>

        {/* View All Categories Link Button */}
        <button
          type="button"
          onClick={onOpenAllCategoriesModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13.5px',
            fontWeight: 700,
            color: '#6D28D9',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#581C87';
            e.currentTarget.style.backgroundColor = '#FAF5FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6D28D9';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Grid size={15} />
          <span>View All Categories</span>
        </button>
      </div>

      {/* Slider Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollBy(-320)}
            aria-label="Scroll left categories"
            style={{
              position: 'absolute',
              left: '-14px',
              zIndex: 10,
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(109, 40, 217, 0.18)',
              border: '1px solid #E9D5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#7E22CE',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7E22CE';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = '#7E22CE';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
        )}

        {/* Categories Track (Circular Image Card Style matching homepage) */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="prod-cat-slider-track"
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '16px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            padding: '8px 4px 14px',
            boxSizing: 'border-box',
          }}
        >
          {/* "All Products" Circle Card */}
          <button
            type="button"
            onClick={() => handleCategoryClick(null)}
            className="prod-circle-cat-card"
            style={{
              flex: '0 0 140px',
              minWidth: '140px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: !selectedCategory ? '#FAF5FF' : '#FFFFFF',
              borderRadius: '20px',
              padding: '16px 10px 16px',
              border: !selectedCategory ? '2px solid #7E22CE' : '1px solid #F0ECF8',
              boxShadow: !selectedCategory ? '0 8px 20px rgba(126, 34, 206, 0.16)' : '0 2px 8px rgba(109, 40, 217, 0.04)',
              boxSizing: 'border-box',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '2px auto 10px',
                border: !selectedCategory ? '2.5px solid #7E22CE' : '2.5px solid #F3ECFF',
                boxShadow: '0 4px 14px rgba(109, 40, 217, 0.08)',
                backgroundColor: !selectedCategory ? '#7E22CE' : '#FAF5FF',
                color: !selectedCategory ? '#FFFFFF' : '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 0.35s ease',
              }}
              className="circle-img-wrap"
            >
              <Sparkles size={34} />
            </div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: !selectedCategory ? '#7E22CE' : '#18181B',
                textAlign: 'center',
                lineHeight: 1.25,
              }}
            >
              All Products
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#9333EA',
                marginTop: '3px',
              }}
            >
              Full Catalog
            </div>
          </button>

          {/* Dynamic DB Categories */}
          {displayList.map((cat, idx) => {
            const isSelected = selectedCategory === cat.name;
            const fallbackImg = '/images/storefront/prod-gold-rope.jpg';
            const imgSrc = cat.imageUrl || cat.image || fallbackImg;

            return (
              <button
                key={cat.id || idx}
                type="button"
                onClick={() => handleCategoryClick(cat.name)}
                className="prod-circle-cat-card"
                style={{
                  flex: '0 0 140px',
                  minWidth: '140px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: isSelected ? '#FAF5FF' : '#FFFFFF',
                  borderRadius: '20px',
                  padding: '16px 10px 16px',
                  border: isSelected ? '2px solid #7E22CE' : '1px solid #F0ECF8',
                  boxShadow: isSelected ? '0 8px 20px rgba(126, 34, 206, 0.16)' : '0 2px 8px rgba(109, 40, 217, 0.04)',
                  boxSizing: 'border-box',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                }}
              >
                {/* Circular Product Image Container with Zoom */}
                <div
                  className="circle-img-wrap"
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '2px auto 10px',
                    border: isSelected ? '2.5px solid #7E22CE' : '2.5px solid #F3ECFF',
                    boxShadow: '0 4px 14px rgba(109, 40, 217, 0.08)',
                    backgroundColor: '#FAF5FF',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.35s ease',
                    }}
                    onError={(e) => {
                      e.target.src = fallbackImg;
                    }}
                  />
                </div>

                {/* Title */}
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: isSelected ? 800 : 700,
                    color: isSelected ? '#7E22CE' : '#18181B',
                    textAlign: 'center',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '124px',
                  }}
                >
                  {cat.name}
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isSelected ? '#7E22CE' : '#9CA3AF',
                    marginTop: '3px',
                  }}
                >
                  {isSelected ? 'Active Filter' : 'Explore'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollBy(320)}
            aria-label="Scroll right categories"
            style={{
              position: 'absolute',
              right: '-14px',
              zIndex: 10,
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(109, 40, 217, 0.18)',
              border: '1px solid #E9D5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#7E22CE',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7E22CE';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = '#7E22CE';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
        )}
      </div>

      <style jsx global>{`
        .prod-cat-slider-track::-webkit-scrollbar {
          display: none;
        }
        :global(.prod-circle-cat-card:hover) {
          transform: translateY(-4px);
          border-color: #C084FC !important;
          box-shadow: 0 10px 22px rgba(126, 34, 206, 0.12) !important;
        }
        :global(.prod-circle-cat-card:hover .circle-img-wrap img) {
          transform: scale(1.1);
        }
        :global(.prod-circle-cat-card:hover .circle-img-wrap) {
          border-color: #7E22CE !important;
        }
      `}</style>
    </section>
  );
}
