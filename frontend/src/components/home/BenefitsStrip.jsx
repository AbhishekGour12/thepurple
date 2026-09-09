'use client';

import { Truck, Banknote, RotateCcw, Lock, Headphones } from 'lucide-react';

export default function BenefitsStrip() {
  const benefits = [
    {
      icon: Truck,
      title: 'Free Shipping',
      desc: 'On orders above ₹999',
    },
    {
      icon: Banknote,
      title: 'COD Available',
      desc: 'Pay on delivery',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      desc: '7 days return policy',
    },
    {
      icon: Lock,
      title: 'Secure Payment',
      desc: '100% safe & secure',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'We are here to help',
    },
  ];

  return (
    <section
      style={{
        maxWidth: '1420px',
        margin: '24px auto 0 auto',
        padding: '0 24px',
      }}
    >
      <div
        className="benefits-assurance-bar"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E1F5',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(109, 40, 217, 0.03)',
        }}
      >
        {benefits.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === benefits.length - 1;

          return (
            <div
              key={idx}
              className="benefit-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 14px',
                borderRight: isLast ? 'none' : '1px solid #F0ECF8',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#F5F3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6D28D9',
                  flexShrink: 0,
                }}
              >
                <Icon size={19} strokeWidth={2.2} />
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
                    color: '#5F5A6B',
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
        @media (max-width: 1024px) {
          .benefits-assurance-bar {
            grid-template-columns: repeat(3, 1fr) !important;
            row-gap: 16px !important;
            padding: 16px !important;
          }
          .benefit-item {
            border-right: none !important;
          }
        }
        @media (max-width: 640px) {
          .benefits-assurance-bar {
            grid-template-columns: repeat(2, 1fr) !important;
            row-gap: 14px !important;
          }
        }
      `}</style>
    </section>
  );
}
