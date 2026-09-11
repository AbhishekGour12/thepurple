'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');

    // Simulated subscription call / future API integration
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 800);
  };

  return (
    <section
      style={{
        maxWidth: '1420px',
        margin: '36px auto 0 auto',
        padding: '0 24px',
      }}
    >
      <div
        className="newsletter-box"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E1F5',
          borderRadius: '16px',
          padding: '36px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 4px 16px rgba(109, 40, 217, 0.03)',
        }}
      >
        {/* Left: Heading & Subtitle */}
        <div style={{ flex: '1', minWidth: '280px', maxWidth: '520px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#7C3AED',
              textTransform: 'uppercase',
              marginBottom: '4px',
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
            }}
          >
            STAY UPDATED
          </div>
          <h3
            style={{
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#18181B',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Subscribe to our newsletter
          </h3>
          <p
            style={{
              fontSize: '13.5px',
              color: '#5F5A6B',
              margin: 0,
              lineHeight: 1.5,
              fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
            }}
          >
            Get the latest updates on new arrivals, exclusive offers and more.
          </p>
        </div>

        {/* Right: Input Form or Success Banner */}
        <div style={{ flex: '1', minWidth: '280px', maxWidth: '480px' }}>
          {status === 'success' ? (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#065F46',
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                You&apos;re subscribed! Welcome to ThePurple.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FAF8FC',
                  border: status === 'error' ? '1.5px solid #EF4444' : '1px solid #E8E1F5',
                  borderRadius: '10px',
                  padding: '4px 6px 4px 14px',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <Mail size={17} style={{ color: '#8B8795', marginRight: '10px', flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Enter your email address"
                  disabled={status === 'loading'}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '13.5px',
                    color: '#18181B',
                    backgroundColor: 'transparent',
                    fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    minWidth: '120px',
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    backgroundColor: '#6D28D9',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 22px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (status !== 'loading') e.currentTarget.style.backgroundColor = '#5B21B6';
                  }}
                  onMouseLeave={(e) => {
                    if (status !== 'loading') e.currentTarget.style.backgroundColor = '#6D28D9';
                  }}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </div>

              {status === 'error' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#DC2626',
                    fontSize: '12px',
                    marginTop: '6px',
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .newsletter-box {
            padding: 24px 20px !important;
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  );
}
