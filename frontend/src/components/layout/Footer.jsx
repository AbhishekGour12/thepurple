'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Sparkles, ArrowRight } from 'lucide-react';
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
          boxSizing: 'border-box',
        }}
      >
        {/* Main Footer Links Grid */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2.2fr 1.1fr 1.1fr 1.2fr 1.1fr 1.8fr',
            gap: '36px',
            paddingBottom: '44px',
          }}
        >
          {/* Col 1: Brand Info & Socials */}
          <div className="footer-col-brand" style={{ minWidth: 0 }}>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
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
              Your one-stop destination for fine jewellery, cute teddy bears, celebration gift hampers &amp; little luxuries.
            </p>

            {/* Social Links */}
            <div style={{ marginTop: '8px' }}>
              <SocialIcons size={34} />
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="footer-col-shop" style={{ minWidth: 0 }}>
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
                { label: 'All Products', href: '/products' },
                { label: 'New Arrivals', href: '/new-arrivals' },
                { label: 'Best Sellers', href: '/best-sellers' },
                { label: 'Special Offers', href: '/offers' },
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
          <div className="footer-col-categories" style={{ minWidth: 0 }}>
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
          <div className="footer-col-care" style={{ minWidth: 0 }}>
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
          <div className="footer-col-company" style={{ minWidth: 0 }}>
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
                { label: 'Contact Us', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Terms & Conditions', href: '/terms' },
                { label: 'Admin Panel', href: '/admin' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      fontSize: '13.5px',
                      color: link.href === '/admin' ? '#7C3AED' : '#5F5A6B',
                      fontWeight: link.href === '/admin' ? 600 : 400,
                      transition: 'color 0.15s ease',
                      fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#6D28D9')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = link.href === '/admin' ? '#7C3AED' : '#5F5A6B')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 6: Contact Us */}
          <div className="footer-col-contact" style={{ minWidth: 0 }}>
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

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '13px',
                color: '#5F5A6B',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #EDE9FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6D28D9',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={14} />
                </div>
                <a
                  href="tel:+919876543210"
                  style={{
                    color: '#18181B',
                    fontWeight: 600,
                    textDecoration: 'none',
                    wordBreak: 'break-word',
                  }}
                >
                  +91 98765 43210
                </a>
              </div>

              {/* Email with overflow protection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: '#FDF2F8',
                    border: '1px solid #FCE7F3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#BE185D',
                    flexShrink: 0,
                  }}
                >
                  <Mail size={14} />
                </div>
                <a
                  href="mailto:support@thepurple.com"
                  style={{
                    color: '#18181B',
                    fontWeight: 600,
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere',
                    minWidth: 0,
                  }}
                >
                  support@thepurple.com
                </a>
              </div>

              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <MapPin size={14} />
                </div>
                <span
                  style={{
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    color: '#5F5A6B',
                  }}
                >
                  104, Jewellery Plaza, Karol Bagh, New Delhi, India – 110005
                </span>
              </div>

              {/* Dedicated Contact Us Link CTA */}
              <div style={{ marginTop: '4px' }}>
                <Link
                  href="/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    color: '#7E22CE',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7E22CE';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FAF5FF';
                    e.currentTarget.style.color = '#7E22CE';
                  }}
                >
                  <span>Customer Support &amp; Concierge</span>
                  <ArrowRight size={13} />
                </Link>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span>&copy; {currentYear} ThePurple. All Rights Reserved.</span>
            <span style={{ color: '#D1D5DB' }}>•</span>
            <Link
              href="/admin"
              style={{
                color: '#6D28D9',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '12.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Admin Portal
            </Link>
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
        @media (max-width: 680px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 26px 16px !important;
          }
          .footer-col-brand {
            grid-column: 1 / -1 !important;
            border-bottom: 1px solid #F0ECF8;
            padding-bottom: 20px;
          }
          .footer-col-brand p {
            max-width: 100% !important;
          }
          .footer-col-contact {
            grid-column: 1 / -1 !important;
            border-top: 1px solid #F0ECF8;
            padding-top: 20px;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 420px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .footer-col-brand {
            border-bottom: 1px solid #F0ECF8;
          }
          .footer-col-contact {
            border-top: 1px solid #F0ECF8;
          }
        }
      `}</style>
    </footer>
  );
}
