'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import SocialIcons from './SocialIcons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E8E1F5',
        marginTop: '60px',
        padding: '54px 0 0 0',
      }}
    >
      <div
        style={{
          maxWidth: '1420px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* Main Footer Links Grid (6 columns on desktop) */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2.2fr 1.2fr 1.2fr 1.3fr 1.1fr 1.8fr',
            gap: '36px',
            paddingBottom: '44px',
          }}
        >
          {/* Col 1: Brand Info & Socials */}
          <div>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#6D28D9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Sparkles size={18} />
              </div>
              <span
                style={{
                  fontSize: '21px',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: '#18181B',
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                The<span style={{ color: '#6D28D9' }}>Purple</span>
              </span>
            </Link>

            <p
              style={{
                fontSize: '13.5px',
                lineHeight: '1.6',
                color: '#5F5A6B',
                margin: '0 0 18px 0',
                maxWidth: '280px',
                fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              Your one-stop destination for stylish jewellery, cute teddy bears, gifts &amp; more.
            </p>

            {/* Social Links — real SVG icons */}
            <SocialIcons size={34} />
          </div>

          {/* Col 2: Shop */}
          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#18181B',
                marginBottom: '16px',
                letterSpacing: '0.02em',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              }}
            >
              Shop
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'All Products', href: '/shop' },
                { label: 'New Arrivals', href: '/new-arrivals' },
                { label: 'Best Sellers', href: '/best-sellers' },
                { label: 'Offers', href: '/offers' },
                { label: 'Gift Cards', href: '/gift-cards' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      color: '#5F5A6B',
                      transition: 'color 0.15s ease',
                      fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#6D28D9')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5F5A6B')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#18181B',
                marginBottom: '16px',
                letterSpacing: '0.02em',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              }}
            >
              Categories
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Chains', href: '/category/chains' },
                { label: 'Earrings', href: '/category/earrings' },
                { label: 'Necklaces', href: '/category/necklaces' },
                { label: 'Bangles', href: '/category/bangles' },
                { label: 'Teddy Bears', href: '/category/teddy-bears' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      color: '#5F5A6B',
                      transition: 'color 0.15s ease',
                      fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#6D28D9')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5F5A6B')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Customer Care */}
          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#18181B',
                marginBottom: '16px',
                letterSpacing: '0.02em',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              }}
            >
              Customer Care
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'Shipping Policy', href: '/shipping-policy' },
                { label: 'Return Policy', href: '/return-policy' },
                { label: 'Track Order', href: '/track-order' },
                { label: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      color: '#5F5A6B',
                      transition: 'color 0.15s ease',
                      fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#6D28D9')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5F5A6B')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Company */}
          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#18181B',
                marginBottom: '16px',
                letterSpacing: '0.02em',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              }}
            >
              Company
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Terms & Conditions', href: '/terms' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      color: '#5F5A6B',
                      transition: 'color 0.15s ease',
                      fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#6D28D9')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5F5A6B')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 6: Contact Us */}
          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#18181B',
                marginBottom: '16px',
                letterSpacing: '0.02em',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              }}
            >
              Contact Us
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#5F5A6B' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Phone size={15} color="#6D28D9" style={{ marginTop: '2px', flexShrink: 0 }} />
                <a href="tel:+919876543210" style={{ color: '#5F5A6B', textDecoration: 'none' }}>
                  +91 98765 43210
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Mail size={15} color="#6D28D9" style={{ marginTop: '2px', flexShrink: 0 }} />
                <a href="mailto:support@thepurple.com" style={{ color: '#5F5A6B', textDecoration: 'none' }}>
                  support@thepurple.com
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} color="#6D28D9" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>104, Jewellery Plaza, Karol Bagh, New Delhi, India</span>
              </div>
              <div style={{ marginTop: '6px' }}>
                <SocialIcons size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div
          className="footer-bottom-bar"
          style={{
            borderTop: '1px solid #EDE8F7',
            padding: '20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '13px',
            color: '#8B8795',
          }}
        >
          <div>
            &copy; {currentYear} ThePurple. All Rights Reserved.
          </div>

          {/* Payment Method Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', marginRight: '4px' }}>
              100% Secure Payments:
            </span>
            {['VISA', 'Mastercard', 'UPI', 'RuPay'].map((pm) => (
              <span
                key={pm}
                style={{
                  backgroundColor: '#FAF8FC',
                  border: '1px solid #E8E1F5',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#4C1D95',
                  letterSpacing: '0.04em',
                }}
              >
                {pm}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          .footer-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            row-gap: 32px !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </footer>
  );
}
