'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  Heart,
  Gift,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function HomeAboutSection() {
  return (
    <section
      style={{
        padding: '50px 24px 60px',
        maxWidth: '1380px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          borderRadius: '28px',
          backgroundColor: '#FFFFFF',
          backgroundImage: `
            radial-gradient(circle at 5% 10%, rgba(147, 51, 234, 0.04) 0%, transparent 40%),
            radial-gradient(circle at 95% 90%, rgba(192, 132, 252, 0.06) 0%, transparent 40%),
            linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%)
          `,
          border: '1.5px solid #F3E8FF',
          boxShadow: '0 20px 40px rgba(126, 34, 206, 0.05)',
          padding: 'clamp(28px, 4.5vw, 52px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="about-section-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            gap: 'clamp(36px, 5vw, 60px)',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Visual Showcase & Brand Collage */}
          <div className="about-visual-col" style={{ position: 'relative' }}>
            {/* Main Featured Image Card */}
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(126, 34, 206, 0.12)',
                border: '2px solid #E9D5FF',
                aspectRatio: '4 / 3.3',
                backgroundColor: '#FAF5FF',
              }}
            >
              <img
                src="/images/storefront/hero-gold.jpg"
                alt="ThePurple Artisanal Craftsmanship"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                }}
                className="about-main-img"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(24, 11, 43, 0.75) 0%, rgba(24, 11, 43, 0.2) 40%, transparent 70%)',
                }}
              />

              {/* Bottom Quote inside Image */}
              <div
                className="about-image-caption"
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '18px',
                  maxWidth: '56%',
                  color: '#FFFFFF',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#FCD34D',
                    textTransform: 'uppercase',
                    marginBottom: '3px',
                  }}
                >
                  Signature Purity
                </div>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  }}
                >
                  Handcrafted with pure passion &amp; heirloom perfection
                </div>
              </div>
            </div>

            {/* Floating Trust Badge (Top-Right) */}
            <div
              className="about-badge-top"
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '10px 16px',
                boxShadow: '0 12px 28px rgba(126, 34, 206, 0.15)',
                border: '1.5px solid #E9D5FF',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7E22CE',
                  flexShrink: 0,
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E1B4B' }}>22K BIS Hallmarked</div>
                <div style={{ fontSize: '10.5px', color: '#6B7280' }}>100% Certified Purity</div>
              </div>
            </div>

            {/* Floating Happiness Counter (Bottom-Right / Side - No Overlap with Quote) */}
            <div
              className="about-badge-bottom"
              style={{
                position: 'absolute',
                bottom: '-16px',
                right: '-12px',
                backgroundColor: '#1E1B4B',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '10px 16px',
                boxShadow: '0 15px 30px rgba(30, 27, 75, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: 4,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F472B6',
                  flexShrink: 0,
                }}
              >
                <Heart size={18} fill="#F472B6" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>50,000+</div>
                <div style={{ fontSize: '10.5px', color: '#D8B4FE', marginTop: '1px' }}>Happy Royals Celebrated</div>
              </div>
            </div>
          </div>

          {/* Right Column: Brand Story Narrative */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Badge Tag */}
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
                marginBottom: '14px',
                alignSelf: 'flex-start',
              }}
            >
              <Sparkles size={14} color="#7E22CE" />
              <span>About ThePurple</span>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: 'clamp(24px, 3.2vw, 34px)',
                fontWeight: 800,
                color: '#1E1B4B',
                lineHeight: 1.2,
                margin: '0 0 14px',
                letterSpacing: '-0.02em',
              }}
            >
              Crafting Royal Elegance, <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #7E22CE 0%, #DB2777 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Celebrating Every Special Moment
              </span>
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: '14.5px',
                lineHeight: 1.65,
                color: '#4B5563',
                margin: '0 0 24px',
              }}
            >
              At <strong>ThePurple</strong>, we believe every piece of fine jewellery is more than an accessory—it is an heirloom of cherished memories. From royal 22K gold rope chains and sparkling solitaires to heartfelt celebration gift sets, our master artisans craft each piece with unparalleled passion.
            </p>

            {/* Feature Highlights Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                marginBottom: '28px',
              }}
            >
              {/* Feature 1 */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <CheckCircle2 size={18} color="#7E22CE" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B' }}>Master Craftsmanship</div>
                  <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px' }}>Heirloom finishes with hallmarked purity</div>
                </div>
              </div>

              {/* Feature 2 */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <Gift size={18} color="#BE185D" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B' }}>Signature Packaging</div>
                  <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px' }}>Complimentary luxury velvet gift boxing</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 26px',
                  borderRadius: '12px',
                  backgroundColor: '#7E22CE',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(126, 34, 206, 0.35)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6B21A8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7E22CE';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Read Our Full Story</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#7E22CE';
                  e.currentTarget.style.color = '#7E22CE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <span>Browse Collections</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :global(.about-main-img:hover) {
          transform: scale(1.04);
        }
        @media (max-width: 960px) {
          .about-section-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 640px) {
          .about-visual-col {
            margin-bottom: 28px !important;
          }
          .about-badge-top {
            top: -10px !important;
            right: 0 !important;
            padding: 8px 12px !important;
          }
          .about-badge-bottom {
            bottom: -14px !important;
            right: 0 !important;
            padding: 8px 12px !important;
          }
          .about-image-caption {
            max-width: 52% !important;
            bottom: 12px !important;
            left: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .about-image-caption {
            max-width: 50% !important;
          }
        }
      `}</style>
    </section>
  );
}
