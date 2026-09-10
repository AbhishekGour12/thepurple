'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Gem,
  Heart,
  Gift,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Users,
  Box,
  Star,
  Award,
} from 'lucide-react';

import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import BenefitsStrip from '@/components/home/BenefitsStrip';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const [activeValueSlide, setActiveValueSlide] = useState(0);
  const valuesScrollRef = useRef(null);

  const stats = [
    {
      icon: Users,
      value: '50K+',
      label: 'Happy Customers',
    },
    {
      icon: Box,
      value: '500+',
      label: 'Unique Designs',
    },
    {
      icon: Star,
      value: '4.8/5',
      label: 'Customer Rating',
    },
    {
      icon: Heart,
      value: '100%',
      label: 'Passion for You',
    },
  ];

  const values = [
    {
      id: 1,
      icon: Gem,
      title: 'Quality First',
      description: 'We source the finest materials to ensure lasting beauty.',
    },
    {
      id: 2,
      icon: Heart,
      title: 'Customer Happiness',
      description: 'Your trust means everything to us.',
    },
    {
      id: 3,
      icon: Leaf,
      title: 'Sustainable Choices',
      description: 'We care for a brighter, more beautiful future.',
    },
    {
      id: 4,
      icon: ShieldCheck,
      title: 'Safe & Secure',
      description: 'Your shopping experience is always safe with us.',
    },
  ];

  const scrollValues = (direction) => {
    if (valuesScrollRef.current) {
      const scrollAmount = 300;
      valuesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#FCFBFE',
      }}
    >
      {/* 1. Global Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Global Main Header */}
      <MainHeader />

      {/* ─── MAIN ABOUT US CONTENT ───────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {/* ─── 1. ABOUT HERO SECTION ─────────────────────────────────────── */}
        <section
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #FBF8FF 0%, #F5EFFF 45%, #FCFBFE 100%)',
            padding: '24px 0 60px 0',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '15%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(221, 214, 254, 0.45) 0%, rgba(255, 255, 255, 0) 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div
            style={{
              maxWidth: '1420px',
              margin: '0 auto',
              padding: '0 24px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#8B8795',
                marginBottom: '32px',
                fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              <Link
                href="/"
                style={{
                  color: '#5F5A6B',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6D28D9')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#5F5A6B')}
              >
                Home
              </Link>
              <span>/</span>
              <span style={{ color: '#18181B', fontWeight: 600 }}>About Us</span>
            </nav>

            {/* Hero Main Two-Column Row */}
            <div
              className="about-hero-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.05fr 1.15fr auto',
                alignItems: 'center',
                gap: '40px',
              }}
            >
              {/* Left Content */}
              <div className="about-hero-text">
                <h1
                  style={{
                    fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                    fontSize: 'clamp(2.6rem, 4.4vw, 3.8rem)',
                    lineHeight: 1.1,
                    fontWeight: 700,
                    color: '#18181B',
                    margin: '0 0 20px 0',
                    letterSpacing: '-0.025em',
                  }}
                >
                  Our Story.
                  <br />
                  A More Beautiful
                  <br />
                  <span style={{ color: '#6D28D9' }}>Tomorrow.</span>
                </h1>

                <p
                  style={{
                    fontSize: '15.5px',
                    lineHeight: 1.65,
                    color: '#5F5A6B',
                    maxWidth: '440px',
                    margin: '0 0 32px 0',
                    fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  At ThePurple, we believe every moment deserves a touch of beauty, love and meaning.
                </p>

                <Link
                  href="/products"
                  className="about-cta-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#6D28D9',
                    color: '#FFFFFF',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(109, 40, 217, 0.28)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5B21B6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(109, 40, 217, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6D28D9';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(109, 40, 217, 0.28)';
                  }}
                >
                  <span>Shop Our Collection</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Center Right Hero Branded Image */}
              <div
                className="about-hero-image-wrapper"
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '560px',
                    height: '420px',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 45px rgba(109, 40, 217, 0.12)',
                  }}
                >
                  <img
                    src="/images/about/about-hero-giftbox.jpg"
                    alt="ThePurple Luxury Gift Box and Jewellery"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />

                  {/* Soft Vignette Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(76, 29, 149, 0.08) 0%, transparent 60%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Far Right Editorial Navigation Column */}
              <div
                className="about-hero-side-nav"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  paddingLeft: '16px',
                  borderLeft: '1px solid rgba(109, 40, 217, 0.15)',
                }}
              >
                {['JEWELLERY', 'GIFTS', 'LIFESTYLE', 'EMOTIONS'].map((item) => (
                  <span
                    key={item}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      color: '#8B8795',
                      textTransform: 'uppercase',
                      fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                    }}
                  >
                    {item}
                  </span>
                ))}
                <div
                  style={{
                    width: '28px',
                    height: '1.5px',
                    backgroundColor: '#DDD6FE',
                    margin: '6px 0',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: '#6D28D9',
                    textTransform: 'uppercase',
                    fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                  }}
                >
                  ALL IN
                  <br />
                  PURPLE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. OUR STORY SECTION ───────────────────────────────────────── */}
        <section
          style={{
            maxWidth: '1420px',
            margin: '40px auto 70px auto',
            padding: '0 24px',
          }}
        >
          <div
            className="about-story-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.15fr',
              gap: '56px',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Arched Story Portrait */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '460px',
                  height: '520px',
                  borderRadius: '160px 160px 32px 32px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 45px rgba(109, 40, 217, 0.1)',
                  backgroundColor: '#EDE9FE',
                }}
              >
                <img
                  src="/images/about/about-story-woman.jpg"
                  alt="Beauty Lives in Every Moment - ThePurple"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Decorative Handwritten Annotation Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 18px',
                    borderRadius: '999px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-script, 'Caveat', cursive)",
                      fontSize: '19px',
                      fontWeight: 700,
                      color: '#6D28D9',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Beauty Lives in Every Moment ♡
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Story Copy & 3 Features */}
            <div>
              {/* Eyebrow */}
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#6D28D9',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                OUR STORY
              </div>

              {/* Main Heading */}
              <h2
                style={{
                  fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                  fontSize: 'clamp(2.2rem, 3.4vw, 3rem)',
                  lineHeight: 1.16,
                  fontWeight: 700,
                  color: '#18181B',
                  margin: '0 0 20px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                ThePurple is more
                <br />
                than a store.{' '}
                <span style={{ color: '#6D28D9' }}>It&apos;s a feeling.</span>
              </h2>

              {/* Paragraphs */}
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: '#5F5A6B',
                  margin: '0 0 16px 0',
                  fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                Founded with a simple belief — that jewellery, gifts and little luxuries can make everyday moments more special. We curate thoughtfully designed pieces that celebrate you, your loved ones, and the stories you create together.
              </p>

              <p
                style={{
                  fontSize: '14.5px',
                  lineHeight: 1.7,
                  color: '#5F5A6B',
                  margin: '0 0 36px 0',
                  fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                From pure 22K gold hallmarked heirlooms to bespoke cuddly gift sets, our mission is to bring elegance and genuine joy to every doorstep across India.
              </p>

              {/* 3 Compact Feature Items */}
              <div
                className="about-story-features"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '18px',
                }}
              >
                {[
                  {
                    icon: Gem,
                    title: 'Thoughtful Designs',
                    desc: 'Elegant, modern and made for everyday moments.',
                  },
                  {
                    icon: Heart,
                    title: 'Made with Love',
                    desc: 'Because every piece carries a story.',
                  },
                  {
                    icon: Gift,
                    title: 'For Every Occasion',
                    desc: "From self-love to special gifts, we've got you.",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #EDE9FE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6D28D9',
                          marginBottom: '12px',
                        }}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#18181B',
                          margin: '0 0 4px 0',
                          fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                        }}
                      >
                        {item.title}
                      </h4>
                      <p
                        style={{
                          fontSize: '12.5px',
                          lineHeight: 1.5,
                          color: '#5F5A6B',
                          margin: 0,
                          fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. BRAND STATISTICS STRIP ───────────────────────────────────── */}
        <section
          style={{
            maxWidth: '1420px',
            margin: '0 auto 80px auto',
            padding: '0 24px',
          }}
        >
          <div
            className="about-stats-bar"
            style={{
              backgroundColor: '#F5F3FF',
              border: '1px solid #E8E1F5',
              borderRadius: '24px',
              padding: '32px 40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              boxShadow: '0 4px 18px rgba(109, 40, 217, 0.04)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {stats.map((item, idx) => {
              const Icon = item.icon;
              const isLast = idx === stats.length - 1;

              return (
                <div
                  key={idx}
                  className="about-stat-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    borderRight: isLast ? 'none' : '1px solid #DDD6FE',
                    paddingRight: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(109, 40, 217, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6D28D9',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                        fontSize: 'clamp(1.7rem, 2.5vw, 2.1rem)',
                        fontWeight: 800,
                        color: '#18181B',
                        lineHeight: 1.1,
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#5F5A6B',
                        marginTop: '2px',
                        fontWeight: 600,
                        fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 4. OUR VALUES SECTION ───────────────────────────────────────── */}
        <section
          style={{
            maxWidth: '1420px',
            margin: '0 auto 80px auto',
            padding: '0 24px',
          }}
        >
          {/* Section Header with Carousel Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#6D28D9',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                OUR VALUES
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                  fontSize: 'clamp(2rem, 3.2vw, 2.6rem)',
                  fontWeight: 700,
                  color: '#18181B',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                What We <span style={{ color: '#6D28D9' }}>Stand For</span>
              </h2>
            </div>

            {/* Subtle Prev/Next Navigation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => scrollValues('left')}
                aria-label="Previous Values"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E8E1F5',
                  color: '#6D28D9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(109, 40, 217, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#6D28D9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#6D28D9';
                  e.currentTarget.style.borderColor = '#E8E1F5';
                }}
              >
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>

              <button
                type="button"
                onClick={() => scrollValues('right')}
                aria-label="Next Values"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E8E1F5',
                  color: '#6D28D9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(109, 40, 217, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#6D28D9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#6D28D9';
                  e.currentTarget.style.borderColor = '#E8E1F5';
                }}
              >
                <ChevronRight size={18} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* 4 Values Cards Grid / Scrollable */}
          <div
            ref={valuesScrollRef}
            className="about-values-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              overflowX: 'auto',
              paddingBottom: '10px',
            }}
          >
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.id}
                  className="about-value-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E1F5',
                    borderRadius: '20px',
                    padding: '28px 24px',
                    boxShadow: '0 4px 16px rgba(109, 40, 217, 0.04)',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '240px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(109, 40, 217, 0.1)';
                    e.currentTarget.style.borderColor = '#C4B5FD';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(109, 40, 217, 0.04)';
                    e.currentTarget.style.borderColor = '#E8E1F5';
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#F5F3FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6D28D9',
                      marginBottom: '18px',
                    }}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>

                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#18181B',
                      margin: '0 0 8px 0',
                      fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                    }}
                  >
                    {val.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '13.5px',
                      lineHeight: 1.55,
                      color: '#5F5A6B',
                      margin: 0,
                      fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    }}
                  >
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 5. WHY CHOOSE THEPURPLE SECTION ─────────────────────────────── */}
        <section
          style={{
            maxWidth: '1420px',
            margin: '0 auto 80px auto',
            padding: '0 24px',
          }}
        >
          <div
            className="about-why-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: '56px',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Jewellery Lifestyle Image */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '560px',
                  height: '380px',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 45px rgba(109, 40, 217, 0.12)',
                }}
              >
                <img
                  src="/images/about/about-why-choose-rings.jpg"
                  alt="Why Choose ThePurple - Premium Fine Jewellery"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Subtle Handwritten Annotation */}
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    padding: '8px 18px',
                    borderRadius: '999px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-script, 'Caveat', cursive)",
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#6D28D9',
                    }}
                  >
                    Small Details Big Happiness ♡
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Copy & Checklist */}
            <div style={{ position: 'relative' }}>
              {/* Eyebrow */}
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#6D28D9',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                WHY CHOOSE THEPURPLE
              </div>

              {/* Main Heading */}
              <h2
                style={{
                  fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                  fontSize: 'clamp(2.1rem, 3.2vw, 2.75rem)',
                  lineHeight: 1.18,
                  fontWeight: 700,
                  color: '#18181B',
                  margin: '0 0 16px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Because You Deserve <span style={{ color: '#6D28D9' }}>More</span>
              </h2>

              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.65,
                  color: '#5F5A6B',
                  margin: '0 0 24px 0',
                  fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                We&apos;re here to make your everyday moments brighter with jewellery, gifts and little luxuries you&apos;ll love.
              </p>

              {/* Checklist */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '32px',
                }}
              >
                {[
                  'Trendy & Timeless Collections',
                  'Gifting for Every Occasion',
                  'Easy Returns & Secure Payments',
                  'A Supportive & Friendly Team',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#18181B',
                      fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    }}
                  >
                    <CheckCircle2 size={18} color="#6D28D9" fill="#EDE9FE" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <Link
                  href="/products"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#6D28D9',
                    color: '#FFFFFF',
                    padding: '13px 30px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 6px 20px rgba(109, 40, 217, 0.25)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5B21B6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6D28D9';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>Shop Now</span>
                  <ArrowRight size={16} />
                </Link>

                {/* Decorative Signature / Thank You */}
                <div
                  style={{
                    fontFamily: "var(--font-script, 'Caveat', cursive)",
                    fontSize: '22px',
                    lineHeight: 1.15,
                    color: '#7C3AED',
                    textAlign: 'right',
                  }}
                >
                  Thank You
                  <br />
                  <span style={{ fontSize: '18px', color: '#5F5A6B' }}>for being a part of our journey ♡</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. SERVICE BENEFITS ASSURANCE STRIP ─────────────────────────── */}
        <BenefitsStrip />
      </main>

      {/* ─── 7. GLOBAL FOOTER ────────────────────────────────────────────── */}
      <Footer />

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .about-hero-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px !important;
          }
          .about-hero-side-nav {
            display: none !important;
          }
          .about-story-grid,
          .about-why-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .about-stats-bar {
            grid-template-columns: repeat(2, 1fr) !important;
            row-gap: 24px !important;
          }
          .about-stat-item:nth-child(2) {
            border-right: none !important;
          }
          .about-values-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .about-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .about-hero-image-wrapper {
            order: -1;
          }
          .about-story-features {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .about-stats-bar {
            grid-template-columns: 1fr !important;
            padding: 24px 20px !important;
          }
          .about-stat-item {
            border-right: none !important;
            border-bottom: 1px solid #DDD6FE;
            padding-bottom: 16px;
          }
          .about-stat-item:last-child {
            border-bottom: none !important;
            padding-bottom: 0;
          }
          .about-values-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
