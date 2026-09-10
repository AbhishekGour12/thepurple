'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function HomeContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 800);
  };

  return (
    <section
      style={{
        padding: '36px 20px 48px',
        maxWidth: '1380px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          borderRadius: '24px',
          backgroundColor: '#FFFFFF',
          backgroundImage: `
            radial-gradient(circle at 90% 10%, rgba(109, 40, 217, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 10% 90%, rgba(219, 39, 119, 0.04) 0%, transparent 50%),
            linear-gradient(135deg, #FFFFFF 0%, #FAF7FF 100%)
          `,
          border: '1.5px solid #F3E8FF',
          boxShadow: '0 12px 32px rgba(109, 40, 217, 0.06)',
          padding: 'clamp(24px, 3.8vw, 42px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="home-contact-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: 'clamp(28px, 4vw, 48px)',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Contact Information & Quick Actions */}
          <div>
            {/* Header Badge */}
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
                marginBottom: '12px',
              }}
            >
              <Sparkles size={14} color="#7E22CE" />
              <span>We Are Here For You</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 800,
                color: '#18181B',
                lineHeight: 1.22,
                margin: '0 0 10px',
                letterSpacing: '-0.02em',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              }}
            >
              Have a Question?{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #7E22CE 0%, #DB2777 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Get In Touch With Us
              </span>
            </h2>

            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#5F5A6B',
                margin: '0 0 24px',
                fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              Whether you need help selecting fine jewellery, tracking an order, or custom bespoke packaging, our royal customer support team is always ready to assist you.
            </p>

            {/* Contact Channels Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '22px',
              }}
            >
              {/* Call Us */}
              <a
                href="tel:+919876543210"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #EDE9FE',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#C4B5FD';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(109, 40, 217, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#EDE9FE';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EDE9FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6D28D9',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Call Anytime
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#18181B' }}>
                    +91 98765 43210
                  </div>
                </div>
              </a>

              {/* Email Us */}
              <a
                href="mailto:support@thepurple.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #EDE9FE',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#C4B5FD';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(109, 40, 217, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#EDE9FE';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FCE7F3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#BE185D',
                    flexShrink: 0,
                  }}
                >
                  <Mail size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#DB2777', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Email Support
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#18181B' }}>
                    support@thepurple.com
                  </div>
                </div>
              </a>
            </div>

            {/* Operating Hours & Dedicated Contact Page Link */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#6B7280' }}>
                <Clock size={15} color="#7E22CE" />
                <span>Mon – Sat: 10:00 AM – 8:00 PM IST</span>
              </div>

              <Link
                href="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#6D28D9',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                <span>Visit Full Contact Page</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Compact Quick Inquiry Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px 22px',
              border: '1.5px solid #E9D5FF',
              boxShadow: '0 10px 25px rgba(109, 40, 217, 0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MessageSquare size={18} color="#7E22CE" />
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#18181B',
                  margin: 0,
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                Send a Quick Message
              </h3>
            </div>

            {isSubmitted ? (
              <div
                style={{
                  padding: '28px 16px',
                  textAlign: 'center',
                  backgroundColor: '#F5F3FF',
                  borderRadius: '14px',
                  border: '1px solid #DDD6FE',
                }}
              >
                <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#18181B', margin: '0 0 6px' }}>
                  Thank You!
                </h4>
                <p style={{ fontSize: '13px', color: '#5F5A6B', margin: 0 }}>
                  We received your message and will respond within 2-4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="contact-form-row">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name *"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FAF8FC',
                        fontSize: '13px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7E22CE')}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address *"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FAF8FC',
                        fontSize: '13px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7E22CE')}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FAF8FC',
                      fontSize: '13px',
                      color: '#18181B',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#7E22CE')}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="How can we help you today? *"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FAF8FC',
                      fontSize: '13px',
                      color: '#18181B',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#7E22CE')}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7E22CE 0%, #6D28D9 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #581C87 100%)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #7E22CE 0%, #6D28D9 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .home-contact-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 500px) {
          .contact-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
