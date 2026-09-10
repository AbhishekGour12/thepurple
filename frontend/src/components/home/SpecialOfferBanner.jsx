'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, ArrowRight, Copy, Check, Sparkles } from 'lucide-react';
import { catalogApi } from '@/lib/api/catalog';

const DEFAULT_OFFER = {
  badge: 'LIMITED TIME PROMOTION',
  title: 'Special Offer Just For You!',
  subtitle: 'Get 10% Off on your first order.',
  highlightText: '10% Off',
  couponCode: 'WELCOME10',
  imageUrl: '/images/storefront/prod-teddy-gift.jpg',
  btnText: 'Shop Now',
  btnUrl: '/shop',
  accentColor: '#6D28D9',
  bgGradient: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
};

export default function SpecialOfferBanner() {
  const [offer, setOffer] = useState(DEFAULT_OFFER);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadOffer() {
      try {
        const data = await catalogApi.getBanners({ placement: 'HOME_OFFER' });
        const list = data?.homeOffer || data?.banners || [];
        if (isMounted && list.length > 0) {
          const item = list[0];
          setOffer({
            badge: item.badge || 'LIMITED TIME PROMOTION',
            title: item.title || 'Special Offer Just For You!',
            subtitle: item.subtitle || item.description || 'Get 10% Off on your first order.',
            highlightText: item.highlight || '10% Off',
            couponCode: item.couponCode || 'WELCOME10',
            imageUrl: item.imageUrl || '/images/storefront/prod-teddy-gift.jpg',
            btnText: item.primaryBtnText || 'Shop Now',
            btnUrl: item.primaryBtnUrl || item.linkUrl || '/shop',
            accentColor: item.accentColor || '#6D28D9',
            bgGradient: item.bgGradient || 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
          });
        }
      } catch {
        // Fallback
      }
    }
    loadOffer();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyCode = () => {
    if (!offer.couponCode) return;
    navigator.clipboard?.writeText(offer.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section
      style={{
        maxWidth: '1420px',
        margin: '40px auto 0 auto',
        padding: '0 24px',
      }}
    >
      <div
        className="special-offer-banner"
        style={{
          background: offer.bgGradient || '#EDE9FE',
          borderRadius: '16px',
          border: '1px solid #DDD6FE',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 36px',
          position: 'relative',
          gap: '24px',
        }}
      >
        {/* Left: Gift Visual */}
        {offer.imageUrl && (
          <div
            className="offer-left-visual"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '14px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(109, 40, 217, 0.12)',
                border: '2px solid #FFFFFF',
                flexShrink: 0,
              }}
            >
              <img
                src={offer.imageUrl}
                alt="Special Offer"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        )}

        {/* Center: Offer Content & Coupon Code */}
        <div
          className="offer-center-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {offer.badge && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: offer.accentColor || '#6D28D9',
                textTransform: 'uppercase',
                marginBottom: '4px',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              }}
            >
              <Sparkles size={14} />
              <span>{offer.badge}</span>
            </div>
          )}

          <h3
            style={{
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)',
              fontWeight: 800,
              color: '#18181B',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            {offer.title}
          </h3>

          {offer.subtitle && (
            <p
              style={{
                fontSize: '14px',
                color: '#5F5A6B',
                margin: '0 0 10px 0',
                fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              {offer.subtitle}
            </p>
          )}

          {/* Coupon Code Pill */}
          {offer.couponCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyCode}
                aria-label="Copy Coupon Code"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px dashed #7C3AED',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3FF')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <Tag size={14} color={offer.accentColor || '#6D28D9'} />
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: offer.accentColor || '#6D28D9', letterSpacing: '0.05em' }}>
                  Use Code: {offer.couponCode}
                </span>
                {copied ? <Check size={14} color="#059669" /> : <Copy size={13} color="#8B8795" />}
              </button>
              {copied && (
                <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700 }}>Copied!</span>
              )}
            </div>
          )}
        </div>

        {/* Right: CTA Button */}
        {offer.btnText && (
          <div className="offer-right-cta" style={{ flexShrink: 0 }}>
            <Link
              href={offer.btnUrl || '/shop'}
              style={{
                backgroundColor: offer.accentColor || '#6D28D9',
                color: '#FFFFFF',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: `0 4px 14px ${offer.accentColor || '#6D28D9'}40`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{offer.btnText}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .special-offer-banner {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 20px !important;
          }
          .offer-right-cta {
            width: 100% !important;
          }
          .offer-right-cta a {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  );
}
