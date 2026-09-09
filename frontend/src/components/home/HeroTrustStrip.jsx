'use client';

import { ShieldCheck, RotateCcw, Lock, Banknote } from 'lucide-react';

export default function HeroTrustStrip() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Premium Quality',
      desc: 'Finest materials',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      desc: '7 days return',
    },
    {
      icon: Lock,
      title: 'Secure Payment',
      desc: '100% safe & secure',
    },
    {
      icon: Banknote,
      title: 'COD Available',
      desc: 'Pay on delivery',
    },
  ];

  return (
    <section
      style={{
        maxWidth: '1420px',
        margin: '20px auto 0 auto',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E1F5',
          borderRadius: '12px',
          padding: '14px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(109, 40, 217, 0.04)',
        }}
        className="hero-trust-grid"
      >
        {features.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === features.length - 1;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 16px',
                borderRight: isLast ? 'none' : '1px solid #F0ECF8',
              }}
              className="trust-item"
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#F5F3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6D28D9',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#18181B',
                    fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#8B8795',
                    marginTop: '2px',
                    fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .hero-trust-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            row-gap: 16px !important;
            padding: 16px 20px !important;
          }
          .trust-item {
            border-right: none !important;
          }
        }
        @media (max-width: 540px) {
          .hero-trust-grid {
            grid-template-columns: 1fr !important;
            row-gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}
