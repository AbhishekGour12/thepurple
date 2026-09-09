'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Award, ArrowRight } from 'lucide-react';

const SLIDE_DURATION = 6000; // 6 seconds per slide

const SLIDES = [
  {
    id: 'slide-gold',
    badge: '✨ ROYAL 22K GOLD',
    title: 'Shine in Every',
    highlight: 'Royal Moment',
    subtitle: 'Handcrafted pure 22K gold rope chains, heirloom bridal necklaces & pendant sets designed to turn heads.',
    image: '/images/storefront/hero-gold.jpg',
    bgGradient: 'linear-gradient(180deg, #F6ECFF 0%, #EFE3FC 45%, #FCFBFE 100%)',
    accentColor: '#6D28D9',
    accentHover: '#5B21B6',
    tagColor: '#7C3AED',
    floatingBadge: { icon: Award, text: '22K BIS Hallmarked' },
    primaryBtn: { text: 'Shop 22K Gold', href: '/category/chains' },
    secondaryBtn: { text: 'Explore Collection', href: '/category/necklaces' },
    discountTag: '🔥 UP TO 25% OFF',
  },
  {
    id: 'slide-diamond',
    badge: '💎 SOLITAIRES & BRIDAL',
    title: 'Sparkling Diamond',
    highlight: 'Forever Radiance',
    subtitle: 'Precision-cut solitaire rings, cascading chandelier earrings & eternity bands with dazzling brilliance.',
    image: '/images/storefront/hero-diamond.jpg',
    bgGradient: 'linear-gradient(180deg, #F3EBFF 0%, #E9DEFE 45%, #FCFBFE 100%)',
    accentColor: '#5B21B6',
    accentHover: '#4C1D95',
    tagColor: '#6D28D9',
    floatingBadge: { icon: ShieldCheck, text: '100% Certified Diamonds' },
    primaryBtn: { text: 'Shop Diamonds', href: '/category/rings' },
    secondaryBtn: { text: 'Bridal Sets', href: '/category/earrings' },
    discountTag: '⭐ 100% CERTIFIED PURITY',
  },
  {
    id: 'slide-gifts',
    badge: '🎁 LUXURY GIFT HAMPERS',
    title: 'Heartfelt Gifts for',
    highlight: 'Special Loved Ones',
    subtitle: 'Plush velvet teddy bears, sparkling crystal heart pendants & bespoke celebration gift boxes with ribbons.',
    image: '/images/storefront/hero-gifts.jpg',
    bgGradient: 'linear-gradient(180deg, #FDEBF4 0%, #F8D8EA 45%, #FCFBFE 100%)',
    accentColor: '#BE185D',
    accentHover: '#9D174D',
    tagColor: '#DB2777',
    floatingBadge: { icon: Sparkles, text: 'Complimentary Gift Box' },
    primaryBtn: { text: 'Shop Gift Sets', href: '/category/gifts' },
    secondaryBtn: { text: 'Teddy Combos', href: '/category/teddy-bears' },
    discountTag: '💝 FREE LUXURY GIFT PACKING',
  },
  {
    id: 'slide-rosegold',
    badge: '🌸 CONTEMPORARY CHIC',
    title: 'The Elegance of',
    highlight: '18K Rose Gold',
    subtitle: 'Sleek diamond-studded bangles, statement rings & minimalist accessories for everyday luxury glamour.',
    image: '/images/storefront/hero-rosegold.jpg',
    bgGradient: 'linear-gradient(180deg, #FFECE7 0%, #F8D7CF 45%, #FCFBFE 100%)',
    accentColor: '#9D174D',
    accentHover: '#831843',
    tagColor: '#BE185D',
    floatingBadge: { icon: Award, text: 'Modern 18K Craftsmanship' },
    primaryBtn: { text: 'Shop Bangles', href: '/category/bangles' },
    secondaryBtn: { text: 'View New Arrivals', href: '/new-arrivals' },
    discountTag: '✨ TRENDING STYLES',
  },
];

export default function HeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (idx) => {
    setActiveSlide(idx);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeSlide]);

  const current = SLIDES[activeSlide];
  const FloatingIcon = current.floatingBadge.icon;

  return (
    <section
      style={{
        position: 'relative',
        maxWidth: '1420px',
        margin: '0 auto 0 auto',
        padding: '0 16px',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* SVG Clip Path Definition for Left-Facing Concave Curve (Ulta-C Curve) */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="heroInvertedCurve" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 C 0.16,0.25 0.16,0.75 0,1 L 1,1 L 1,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Main Completely Borderless Carousel Canvas */}
      <div
        className="hero-banner-card"
        style={{
          position: 'relative',
          borderRadius: '24px 24px 0 0',
          background: current.bgGradient,
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
          minHeight: '520px',
          transition: 'background 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Soft Ambient Radial Light - Left & Background */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Left Content Column */}
        <div
          className="hero-left-content"
          style={{
            flex: '0 0 46%',
            padding: '58px 32px 58px 54px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Eyebrow Badge & Discount Tag */}
          <div
            key={`badge-${activeSlide}`}
            className="hero-fade-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: current.tagColor,
                textTransform: 'uppercase',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {current.badge}
            </div>

            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                color: '#18181B',
                padding: '4px 12px',
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {current.discountTag}
            </div>
          </div>

          {/* Main Heading */}
          <h1
            key={`title-${activeSlide}`}
            className="hero-fade-title"
            style={{
              fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
              fontSize: 'clamp(2.4rem, 4vw, 3.45rem)',
              lineHeight: 1.08,
              fontWeight: 800,
              color: '#18181B',
              margin: '0 0 16px 0',
              letterSpacing: '-0.025em',
            }}
          >
            {current.title}
            <br />
            <span
              style={{
                color: current.accentColor,
                transition: 'color 0.5s ease',
                display: 'inline-block',
              }}
            >
              {current.highlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            key={`sub-${activeSlide}`}
            className="hero-fade-item"
            style={{
              fontSize: '15px',
              lineHeight: '1.65',
              color: '#4B5563',
              margin: '0 0 34px 0',
              maxWidth: '460px',
              fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
            }}
          >
            {current.subtitle}
          </p>

          {/* Action CTA Buttons */}
          <div
            key={`btn-${activeSlide}`}
            className="hero-fade-item"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}
          >
            <Link
              href={current.primaryBtn.href}
              style={{
                backgroundColor: current.accentColor,
                color: '#FFFFFF',
                padding: '13.5px 30px',
                borderRadius: '10px',
                fontSize: '14.5px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: `0 8px 24px ${current.accentColor}40`,
                transition: 'all 0.25s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = current.accentHover;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 12px 28px ${current.accentColor}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = current.accentColor;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${current.accentColor}40`;
              }}
            >
              <Sparkles size={16} />
              <span>{current.primaryBtn.text}</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href={current.secondaryBtn.href}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                color: '#18181B',
                padding: '13.5px 24px',
                borderRadius: '10px',
                fontSize: '14.5px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(109, 40, 217, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.96)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
              }}
            >
              {current.secondaryBtn.text}
            </Link>
          </div>
        </div>

        {/* Right Visual Column with Clean Inverted-C (Left-Facing Concave) Shape */}
        <div
          className="hero-right-visual"
          style={{
            flex: '0 0 54%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Inverted C-Curve Visual Wrapper using SVG ClipPath - 100% Clean, No Strokes */}
          <div
            className="hero-curved-mask"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              clipPath: 'url(#heroInvertedCurve)',
              WebkitClipPath: 'url(#heroInvertedCurve)',
              maskImage: 'linear-gradient(to bottom, black 80%, rgba(0,0,0,0.3) 93%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, rgba(0,0,0,0.3) 93%, transparent 100%)',
              overflow: 'hidden',
            }}
          >
            {SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: activeSlide === idx ? 1 : 0,
                  transform: activeSlide === idx ? 'scale(1)' : 'scale(1.06)',
                  transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: activeSlide === idx ? 'auto' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 40%',
                  }}
                />

                {/* Left Curved Soft Ambient Light Glow */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.16) 0%, rgba(255,255,255,0) 25%, rgba(0,0,0,0.04) 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            ))}

            {/* Floating Luxury Hallmark / Trust Badge */}
            <div
              key={`float-${activeSlide}`}
              className="hero-floating-pill"
              style={{
                position: 'absolute',
                bottom: '36px',
                left: '20%',
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                borderRadius: '999px',
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'none',
                zIndex: 12,
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: current.accentColor,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FloatingIcon size={14} />
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#18181B',
                  letterSpacing: '0.02em',
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                {current.floatingBadge.text}
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Arrow Navigation Buttons */}
        <button
          type="button"
          aria-label="Previous Slide"
          onClick={prevSlide}
          className="hero-nav-arrow hero-nav-prev"
          style={{
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            color: '#18181B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 16,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.22s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = current.accentColor;
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.94)';
            e.currentTarget.style.color = '#18181B';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        <button
          type="button"
          aria-label="Next Slide"
          onClick={nextSlide}
          className="hero-nav-arrow hero-nav-next"
          style={{
            position: 'absolute',
            right: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            color: '#18181B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 16,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.22s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = current.accentColor;
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.94)';
            e.currentTarget.style.color = '#18181B';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronRight size={22} strokeWidth={2.4} />
        </button>

        {/* Carousel Indicators / Dots with Active Expansion */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 20,
            backgroundColor: 'rgba(24, 24, 27, 0.32)',
            backdropFilter: 'blur(10px)',
            padding: '6px 14px',
            borderRadius: '999px',
            border: 'none',
          }}
        >
          {SLIDES.map((slide, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => goToSlide(idx)}
              style={{
                width: activeSlide === idx ? '26px' : '7px',
                height: '7px',
                borderRadius: '999px',
                backgroundColor: activeSlide === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: activeSlide === idx ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Carousel CSS Animations & Responsive Styles */}
      <style jsx>{`
        @keyframes heroFadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroPillPop {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .hero-fade-title {
          animation: heroFadeInUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hero-fade-item {
          animation: heroFadeInUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hero-floating-pill {
          animation: heroPillPop 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }

        @media (max-width: 990px) {
          .hero-banner-card {
            flex-direction: column-reverse !important;
            min-height: auto !important;
            border-radius: 18px !important;
          }
          .hero-left-content {
            flex: 1 1 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 22px 18px 28px 18px !important;
          }
          .hero-left-content :global(h1) {
            font-size: 1.85rem !important;
          }
          .hero-left-content :global(p) {
            font-size: 13px !important;
            margin-bottom: 20px !important;
          }
          .hero-left-content :global(a) {
            padding: 11px 18px !important;
            font-size: 13px !important;
          }
          .hero-right-visual {
            display: block !important;
            flex: 0 0 auto !important;
            width: 100% !important;
            height: 240px !important;
            min-height: 240px !important;
            max-height: 280px !important;
          }
          .hero-curved-mask {
            clip-path: none !important;
            -webkit-clip-path: none !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
            border-radius: 18px 18px 0 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .hero-floating-pill {
            left: 16px !important;
            bottom: 16px !important;
            padding: 6px 12px !important;
          }
          .hero-nav-arrow {
            width: 34px !important;
            height: 34px !important;
          }
          .hero-nav-prev {
            left: 10px !important;
          }
          .hero-nav-next {
            right: 10px !important;
          }
        }

        @media (max-width: 640px) {
          .hero-right-visual {
            height: 200px !important;
            min-height: 200px !important;
          }
          .hero-left-content {
            padding: 16px 14px 24px 14px !important;
          }
          .hero-fade-title {
            font-size: 1.7rem !important;
            line-height: 1.12 !important;
          }
          .hero-fade-item {
            font-size: inherit;
          }
        }
      `}</style>
    </section>
  );
}

