"use client";

import { Gem, Gift, Heart } from 'lucide-react';

export default function LoginMarketingPanel() {
  const benefits = [
    {
      icon: Gem,
      title: 'Trendy Collections',
      desc: 'For every style',
    },
    {
      icon: Gift,
      title: 'Thoughtful Gifts',
      desc: 'For every occasion',
    },
    {
      icon: Heart,
      title: 'A Happier You',
      desc: 'Every single day',
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '8px 12px 24px 0',
        height: '100%',
        maxWidth: '520px',
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.22em',
          color: 'var(--purple-accent, #7C3AED)',
          textTransform: 'uppercase',
          marginBottom: '16px',
          fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
        }}
      >
        MORE THAN JUST PRODUCTS
      </div>

      {/* Editorial Headline */}
      <h1
        style={{
          fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
          fontSize: 'clamp(2.35rem, 3.8vw, 3.55rem)',
          lineHeight: 1.06,
          fontWeight: 700,
          color: 'var(--primary-text, #18181B)',
          margin: '0 0 16px 0',
          letterSpacing: '-0.025em',
        }}
      >
        Little Things
        <br />
        Make Life
        <br />
        <span
          style={{
            color: 'var(--primary-purple, #6D28D9)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Brighter
          <span style={{ fontSize: '0.85em', fontWeight: 400, opacity: 0.9 }}>♡</span>
        </span>
      </h1>

      {/* Supporting Copy */}
      <p
        style={{
          fontSize: '14.5px',
          lineHeight: '1.6',
          color: 'var(--secondary-text, #5F5A6B)',
          maxWidth: '420px',
          margin: '0 0 32px 0',
          fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
        }}
      >
        Discover jewellery, gifts, and more — crafted for your special moments.
      </p>

      {/* 3 Value Points */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {benefits.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(237, 233, 254, 0.92)',
                  border: '1px solid rgba(221, 214, 254, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-purple, #6D28D9)',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px var(--purple-shadow, rgba(109, 40, 217, 0.12))',
                }}
              >
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: 'var(--primary-text, #18181B)',
                    lineHeight: '1.2',
                    fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--secondary-text, #5F5A6B)',
                    marginTop: '2px',
                    fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  {b.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
