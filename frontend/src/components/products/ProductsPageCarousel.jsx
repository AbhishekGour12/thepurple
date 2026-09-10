'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Grid,
  Tag,
  Award,
  ShieldCheck,
  Gift,
  ArrowRight,
} from 'lucide-react';
import { catalogApi } from '@/lib/api/catalog';

const DEFAULT_PRODUCT_SLIDES = [
  {
    id: 'slide-fine-jewellery',
    tag: '👑 ROYAL COLLECTION 2026',
    title: 'Exquisite Fine Jewellery',
    highlight: 'Handcrafted Perfection',
    description: 'Explore certified 22K BIS Hallmarked gold chains, bridal necklaces, solitaire diamond rings & royal jhumkas.',
    image: '/images/storefront/hero-gold.jpg',
    badge: 'UP TO 40% OFF',
    categoryFilter: 'Chains',
    accent: '#A855F7',
    primaryBtnText: 'View All Categories',
    isFullImage: false,
  },
  {
    id: 'slide-luxury-gifts',
    tag: '🎁 CURATED GIFTING & COMBOS',
    title: 'Heartfelt Gifts & Hampers',
    highlight: 'Made for Celebrations',
    description: 'Bespoke velvet teddy bears, crystal pendants & romantic celebration gift hampers with complimentary ribbons.',
    image: '/images/storefront/hero-gifts.jpg',
    badge: 'COMPLIMENTARY PACKING',
    categoryFilter: 'Gifts & Hampers',
    accent: '#EC4899',
    primaryBtnText: 'View All Categories',
    isFullImage: false,
  },
  {
    id: 'slide-contemporary-chic',
    tag: '💎 CONTEMPORARY 18K ROSE GOLD',
    title: 'Modern Diamond & Silver',
    highlight: 'Everyday Luxury Glamour',
    description: 'Precision-cut cubic zirconia, studded bangles, sterling silver chokers & minimal statement accessories.',
    image: '/images/storefront/hero-diamond.jpg',
    badge: 'NEW ARRIVALS 2026',
    categoryFilter: 'Earrings',
    accent: '#38BDF8',
    primaryBtnText: 'View All Categories',
    isFullImage: false,
  },
];

export default function ProductsPageCarousel({ onOpenCategoryModal, onSelectCategory }) {
  const [slides, setSlides] = useState(DEFAULT_PRODUCT_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Touch swipe support
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = (e) => {
    if (e.targetTouches && e.targetTouches.length > 0) {
      touchStartX.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (e.targetTouches && e.targetTouches.length > 0) {
      touchEndX.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 45) {
        nextSlide();
      } else if (diff < -45) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Fetch dynamic banners for Products Page
  useEffect(() => {
    let isMounted = true;
    async function loadProductBanners() {
      try {
        const data = await catalogApi.getBanners({ placement: 'PRODUCTS_HERO' });
        const list = data?.productsHero || data?.banners || [];
        if (isMounted && list.length > 0) {
          const mapped = list.map((b) => ({
            id: b.id,
            tag: b.badge || '💎 COLLECTION 2026',
            title: b.title || '',
            highlight: b.highlight || '',
            description: b.subtitle || b.description || '',
            image: b.imageUrl || '/images/storefront/hero-gold.jpg',
            badge: b.discountTag || 'TRENDING',
            categoryFilter: b.secondaryBtnText || '',
            accent: b.accentColor || '#A855F7',
            primaryBtnText: b.primaryBtnText || 'View All Categories',
            primaryBtnUrl: b.primaryBtnUrl || b.linkUrl || '',
            secondaryBtnText: b.secondaryBtnText || '',
            secondaryBtnUrl: b.secondaryBtnUrl || '',
            isFullImage: Boolean(b.isFullImage),
            linkUrl: b.linkUrl || b.primaryBtnUrl || '',
          }));
          setSlides(mapped);
          setActiveSlide(0);
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadProductBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  const slide = slides[activeSlide] || DEFAULT_PRODUCT_SLIDES[0];

  return (
    <div
      className="prod-carousel-container"
      style={{
        maxWidth: '1380px',
        margin: '20px auto 8px',
        padding: '0 20px',
        width: '100%',
        boxSizing: 'border-box',
        touchAction: 'pan-y',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="prod-carousel-card"
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#1E1035',
          backgroundImage: `
            radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.25) 0%, transparent 50%),
            linear-gradient(135deg, #130726 0%, #200D3E 50%, #3B1270 100%)
          `,
          border: '1px solid rgba(192, 132, 252, 0.2)',
          boxShadow: '0 20px 40px rgba(19, 7, 38, 0.35)',
          minHeight: '280px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* If Full Image Mode */}
        {slide.isFullImage ? (
          <div
            className="prod-carousel-fullimg"
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '260px',
              height: '260px',
            }}
          >
            {slide.linkUrl ? (
              <Link href={slide.linkUrl} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img
                  src={slide.image}
                  alt={slide.title || 'Products Banner'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>
            ) : (
              <img
                src={slide.image}
                alt={slide.title || 'Products Banner'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* View Categories button overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                display: 'flex',
                gap: '10px',
                zIndex: 10,
              }}
            >
              <button
                type="button"
                onClick={onOpenCategoryModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#9333EA',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
                }}
              >
                <Grid size={15} />
                <span>View All Categories</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Slide Content Split */
          <div
            className="prod-carousel-split"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '28px 36px 18px',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {/* Left Text Block */}
            <div className="prod-carousel-content" style={{ flex: '1 1 380px', maxWidth: '600px', zIndex: 2 }}>
              {/* Tag Badge */}
              {slide.tag && (
                <div
                  className="prod-carousel-tag"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: slide.accent,
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    marginBottom: '10px',
                  }}
                >
                  <Sparkles size={12} color={slide.accent} />
                  <span>{slide.tag}</span>
                </div>
              )}

              {/* Slide Title */}
              {slide.title && (
                <h1
                  className="prod-carousel-title"
                  style={{
                    fontSize: 'clamp(22px, 3.2vw, 32px)',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: 1.18,
                    margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {slide.title}
                  {slide.highlight && (
                    <>
                      <br />
                      <span
                        style={{
                          background: 'linear-gradient(90deg, #E9D5FF 0%, #F472B6 50%, #FBBF24 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {slide.highlight}
                      </span>
                    </>
                  )}
                </h1>
              )}

              {/* Description */}
              {slide.description && (
                <p
                  className="prod-carousel-desc"
                  style={{
                    fontSize: '13px',
                    color: '#D8B4FE',
                    lineHeight: 1.45,
                    margin: '0 0 16px',
                    maxWidth: '480px',
                  }}
                >
                  {slide.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="prod-carousel-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* View All Categories Modal Trigger */}
                <button
                  type="button"
                  onClick={onOpenCategoryModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    backgroundColor: '#9333EA',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7E22CE';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#9333EA';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Grid size={15} />
                  <span>{slide.primaryBtnText || 'View All Categories'}</span>
                </button>

                {/* Filter by Category / Explore */}
                {slide.categoryFilter && onSelectCategory && (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(slide.categoryFilter)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    }}
                  >
                    <span>Filter {slide.categoryFilter}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Image Showcase Card */}
            <div
              className="prod-carousel-image-col"
              style={{
                flex: '0 1 280px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '220px',
                  height: '190px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '2px solid rgba(216, 180, 254, 0.3)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title || 'Slide'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s ease',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(19, 7, 38, 0.7) 0%, transparent 60%)',
                  }}
                />
                {slide.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      backgroundColor: '#7E22CE',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    {slide.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar: Indicators & Controls */}
        <div
          className="prod-carousel-bottom-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 36px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Slide Indicator Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: activeSlide === idx ? '24px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  backgroundColor: activeSlide === idx ? '#C084FC' : 'rgba(255, 255, 255, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Prev / Next Controls */}
          {totalSlides > 1 && (
            <div className="prod-carousel-arrow-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="prod-carousel-arrow"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="prod-carousel-arrow"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .prod-carousel-container {
            margin: 10px auto 4px !important;
            padding: 0 12px !important;
          }
          .prod-carousel-card {
            min-height: 220px !important;
            height: 220px !important;
            border-radius: 16px !important;
            position: relative !important;
            overflow: hidden !important;
          }
          .prod-carousel-split {
            position: absolute !important;
            inset: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
          }
          .prod-carousel-image-col {
            display: block !important;
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1 !important;
            padding: 0 !important;
          }
          .prod-carousel-image-col > div {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .prod-carousel-image-col img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
          .prod-carousel-content {
            position: absolute !important;
            bottom: 38px !important;
            left: 12px !important;
            right: 12px !important;
            z-index: 4 !important;
            max-width: none !important;
            width: auto !important;
            padding: 0 !important;
          }
          .prod-carousel-tag {
            display: none !important;
          }
          .prod-carousel-title {
            display: none !important;
          }
          .prod-carousel-desc {
            display: none !important;
          }
          .prod-carousel-actions {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
          }
          .prod-carousel-actions button {
            padding: 7px 13px !important;
            font-size: 11.5px !important;
            border-radius: 8px !important;
            white-space: nowrap !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          }
          .prod-carousel-arrow {
            display: none !important;
          }
          .prod-carousel-bottom-bar {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 5 !important;
            padding: 6px 14px !important;
            justify-content: center !important;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%) !important;
            border-top: none !important;
          }
          .prod-carousel-fullimg {
            height: 220px !important;
            min-height: 220px !important;
          }
        }
      `}</style>
    </div>
  );
}
