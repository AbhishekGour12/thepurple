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
  ChevronDown,
  Headphones,
  Package,
  Navigation,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import BenefitsStrip from '@/components/home/BenefitsStrip';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    orderId: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // First FAQ open by default

  const faqs = [
    {
      q: 'How can I track my order?',
      a: 'Once your parcel is dispatched, you will receive an automated SMS, WhatsApp and email notification with your live courier tracking ID and link. You can also visit our Track Order page at any time to check real-time shipment milestones.',
    },
    {
      q: 'What is your return policy?',
      a: 'We offer a 7-day hassle-free return and exchange policy for unworn items in their original brand packaging with all certificates and security tags intact. Custom personalized items are covered for transit replacements.',
    },
    {
      q: 'Do you offer Cash on Delivery?',
      a: 'Yes, Cash on Delivery (COD) is available across all serviceable pin codes in India on orders up to ₹10,000 with zero additional convenience fees.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Metro cities are delivered within 2 to 4 business days via express air shipping. Rest of India pin codes receive delivery within 4 to 7 business days.',
    },
    {
      q: 'How can I cancel my order?',
      a: 'Orders can be cancelled before dispatch directly from your Account Orders dashboard or by sending a quick message to our concierge support team.',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        orderId: '',
        message: '',
      });
    }, 800);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

      {/* ─── MAIN CONTACT US CONTENT ─────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {/* ─── 1. HERO BANNER SECTION ────────────────────────────────────── */}
        <section
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #FBF8FF 0%, #F5EFFF 50%, #FCFBFE 100%)',
            padding: '28px 0 54px 0',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              right: '10%',
              width: '520px',
              height: '520px',
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
                marginBottom: '28px',
                fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              <Link
                href="/"
                style={{ color: '#5F5A6B', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6D28D9')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#5F5A6B')}
              >
                Home
              </Link>
              <span>/</span>
              <span style={{ color: '#18181B', fontWeight: 600 }}>Contact Us</span>
            </nav>

            {/* Hero Main Two-Column Row */}
            <div
              className="contact-hero-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.05fr 1.25fr',
                alignItems: 'center',
                gap: '40px',
              }}
            >
              {/* Left Column: Headline & Action */}
              <div className="contact-hero-text">
                {/* Eyebrow Pill */}
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: '#6D28D9',
                    textTransform: 'uppercase',
                    marginBottom: '14px',
                    fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                  }}
                >
                  WE&apos;RE HERE FOR YOU
                </div>

                <h1
                  style={{
                    fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
                    fontSize: 'clamp(2.5rem, 4.4vw, 3.8rem)',
                    lineHeight: 1.1,
                    fontWeight: 700,
                    color: '#18181B',
                    margin: '0 0 18px 0',
                    letterSpacing: '-0.025em',
                  }}
                >
                  Let&apos;s Talk.
                  <br />
                  We&apos;re <span style={{ color: '#6D28D9' }}>Listening.</span>
                </h1>

                <p
                  style={{
                    fontSize: '15.5px',
                    lineHeight: 1.65,
                    color: '#5F5A6B',
                    maxWidth: '460px',
                    margin: '0 0 28px 0',
                    fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                  }}
                >
                  Have a question about your order, a product, or anything else? Our team would love to help.
                </p>

                <button
                  type="button"
                  onClick={() => scrollToSection('contact-form-section')}
                  className="contact-cta-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#6D28D9',
                    color: '#FFFFFF',
                    padding: '13.5px 30px',
                    borderRadius: '12px',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
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
                  <span>Get In Touch</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Right Column: Hero Giftbox Visual Artwork */}
              <div
                className="contact-hero-image-wrapper"
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
                    maxWidth: '620px',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 45px rgba(109, 40, 217, 0.12)',
                    backgroundColor: '#FAF5FF',
                  }}
                >
                  <img
                    src="/images/contact/contact-hero-giftbox.jpg"
                    alt="ThePurple Luxury Gift Box & Jewellery Concierge"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Soft Vignette Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(76, 29, 149, 0.05) 0%, transparent 60%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Floating Handwritten Decorative Text on Right */}
                <div
                  className="contact-hero-script"
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '-16px',
                    fontFamily: "var(--font-script, 'Caveat', cursive)",
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#6D28D9',
                    lineHeight: 1.15,
                    transform: 'rotate(5deg)',
                    pointerEvents: 'none',
                  }}
                >
                  Same
                  <br />
                  Sparkle
                  <br />
                  New
                  <br />
                  Stories ♡
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. HOW CAN WE HELP? (4 CONTACT CARDS) ─────────────────────── */}
        <section
          style={{
            maxWidth: '1420px',
            margin: '40px auto 60px auto',
            padding: '0 24px',
          }}
        >
          {/* Section Heading */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                fontSize: 'clamp(24px, 3.2vw, 32px)',
                fontWeight: 800,
                color: '#18181B',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em',
              }}
            >
              How Can We Help?
            </h2>
            <p
              style={{
                fontSize: '14.5px',
                color: '#5F5A6B',
                margin: 0,
                fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              Choose the best way to reach us. We&apos;re always happy to assist!
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div
            className="contact-cards-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {/* Card 1: Call Us */}
            <div
              className="help-channel-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #EDE8F7',
                padding: '24px 20px',
                boxShadow: '0 4px 18px rgba(109, 40, 217, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6D28D9',
                  marginBottom: '14px',
                }}
              >
                <Phone size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#18181B', margin: '0 0 6px 0' }}>
                Call Us
              </h3>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#6D28D9', marginBottom: '4px' }}>
                +91 98765 43210
              </div>
              <div style={{ fontSize: '12px', color: '#8B8795', marginBottom: '18px' }}>
                Mon – Sat, 10 AM – 7 PM
              </div>
              <a
                href="tel:+919876543210"
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  color: '#6D28D9',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAF5FF';
                  e.currentTarget.style.color = '#6D28D9';
                }}
              >
                Call Now
              </a>
            </div>

            {/* Card 2: Email Us */}
            <div
              className="help-channel-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #EDE8F7',
                padding: '24px 20px',
                boxShadow: '0 4px 18px rgba(109, 40, 217, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6D28D9',
                  marginBottom: '14px',
                }}
              >
                <Mail size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#18181B', margin: '0 0 6px 0' }}>
                Email Us
              </h3>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#6D28D9', marginBottom: '4px', wordBreak: 'break-all' }}>
                support@thepurple.com
              </div>
              <div style={{ fontSize: '12px', color: '#8B8795', marginBottom: '18px' }}>
                We usually reply within 24 hours.
              </div>
              <a
                href="mailto:support@thepurple.com"
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  color: '#6D28D9',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAF5FF';
                  e.currentTarget.style.color = '#6D28D9';
                }}
              >
                Email Us
              </a>
            </div>

            {/* Card 3: WhatsApp */}
            <div
              className="help-channel-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #EDE8F7',
                padding: '24px 20px',
                boxShadow: '0 4px 18px rgba(109, 40, 217, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6D28D9',
                  marginBottom: '14px',
                }}
              >
                <MessageSquare size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#18181B', margin: '0 0 6px 0' }}>
                WhatsApp
              </h3>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Chat with our support team
              </div>
              <div style={{ fontSize: '12px', color: '#8B8795', marginBottom: '18px' }}>
                Quick assistance for your questions.
              </div>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  color: '#6D28D9',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAF5FF';
                  e.currentTarget.style.color = '#6D28D9';
                }}
              >
                <span>💬 Chat With Us</span>
              </a>
            </div>

            {/* Card 4: Visit Us */}
            <div
              className="help-channel-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #EDE8F7',
                padding: '24px 20px',
                boxShadow: '0 4px 18px rgba(109, 40, 217, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6D28D9',
                  marginBottom: '14px',
                }}
              >
                <MapPin size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#18181B', margin: '0 0 6px 0' }}>
                Visit Us
              </h3>
              <div style={{ fontSize: '12.5px', color: '#5F5A6B', marginBottom: '4px', lineHeight: 1.4 }}>
                123, Purple Street, Mumbai, Maharashtra - 400001
              </div>
              <div style={{ fontSize: '12px', color: '#8B8795', marginBottom: '18px' }}>
                Mon – Sat, 10 AM – 7 PM
              </div>
              <button
                type="button"
                onClick={() => scrollToSection('location-section')}
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  color: '#6D28D9',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAF5FF';
                  e.currentTarget.style.color = '#6D28D9';
                }}
              >
                View Location
              </button>
            </div>
          </div>
        </section>

        {/* ─── 3. SEND US A MESSAGE + RIGHT INFO SHOWCASE ─────────────────── */}
        <section
          id="contact-form-section"
          style={{
            maxWidth: '1420px',
            margin: '0 auto 70px auto',
            padding: '0 24px',
          }}
        >
          <div
            className="contact-form-layout-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.25fr 1fr',
              gap: '36px',
              alignItems: 'stretch',
            }}
          >
            {/* Left: Message Form Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #EDE8F7',
                padding: 'clamp(24px, 4vw, 36px)',
                boxShadow: '0 4px 20px rgba(109, 40, 217, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#18181B',
                  margin: '0 0 6px 0',
                }}
              >
                Send Us a Message
              </h2>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#6B7280',
                  margin: '0 0 24px 0',
                  fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                Fill in the details below and our team will get back to you soon.
              </p>

              {isSubmitted ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: '#FAF5FF',
                    borderRadius: '16px',
                    border: '1.5px solid #DDD6FE',
                    margin: 'auto 0',
                  }}
                >
                  <CheckCircle2 size={44} color="#16A34A" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#18181B', margin: '0 0 6px' }}>
                    Message Sent Successfully!
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#5F5A6B', margin: '0 auto 16px', maxWidth: '380px' }}>
                    Thank you for writing to ThePurple. Our concierge support will reach out within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    style={{
                      padding: '9px 22px',
                      borderRadius: '10px',
                      backgroundColor: '#6D28D9',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Row 1: Full Name & Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="contact-form-row">
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Full Name <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #E5E7EB',
                          backgroundColor: '#FAF8FC',
                          fontSize: '13.5px',
                          color: '#18181B',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Email <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #E5E7EB',
                          backgroundColor: '#FAF8FC',
                          fontSize: '13.5px',
                          color: '#18181B',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone & Subject */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="contact-form-row">
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #E5E7EB',
                          backgroundColor: '#FAF8FC',
                          fontSize: '13.5px',
                          color: '#18181B',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Subject <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #E5E7EB',
                            backgroundColor: '#FAF8FC',
                            fontSize: '13.5px',
                            color: formData.subject ? '#18181B' : '#9CA3AF',
                            outline: 'none',
                            boxSizing: 'border-box',
                            appearance: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="" disabled>Select a subject</option>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Order Tracking & Status">Order Tracking &amp; Status</option>
                          <option value="Product Details & Customization">Product Details &amp; Customization</option>
                          <option value="Returns & Exchanges">Returns &amp; Exchanges</option>
                          <option value="Corporate & Bulk Gifting">Corporate &amp; Bulk Gifting</option>
                        </select>
                        <ChevronDown size={16} color="#6B7280" style={{ position: 'absolute', right: '12px', top: '14px', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Order ID (Optional) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Order ID <span style={{ color: '#9CA3AF', fontWeight: 500 }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your order ID (optional)"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #E5E7EB',
                        backgroundColor: '#FAF8FC',
                        fontSize: '13.5px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Row 4: Message */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Message <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #E5E7EB',
                        backgroundColor: '#FAF8FC',
                        fontSize: '13.5px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '13px 26px',
                      borderRadius: '10px',
                      backgroundColor: '#6D28D9',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 6px 18px rgba(109, 40, 217, 0.25)',
                      transition: 'all 0.2s ease',
                      alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#5B21B6';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#6D28D9';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}
            </div>

            {/* Right: Info Showcase & Lifestyle Visual Card */}
            <div
              className="contact-showcase-card"
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #F6EEFF 0%, #EDE4FF 100%)',
                border: '1.5px solid #E8DEFA',
                padding: 'clamp(18px, 3.5vw, 32px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(109, 40, 217, 0.05)',
              }}
            >
              {/* Card 1: Need Help? */}
              <div
                className="showcase-subcard showcase-help-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 2px 10px rgba(109, 40, 217, 0.04)',
                }}
              >
                <div className="showcase-subcard-header" style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#FAF5FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6D28D9',
                      flexShrink: 0,
                    }}
                  >
                    <Headphones size={22} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#18181B', margin: '0 0 2px' }}>
                      Need Help?
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      Our customer care team is here for you.
                    </p>
                  </div>
                </div>

                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="showcase-action-btn"
                  style={{
                    backgroundColor: '#6D28D9',
                    color: '#FFFFFF',
                    padding: '9px 16px',
                    borderRadius: '9px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 8px rgba(109, 40, 217, 0.2)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5B21B6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6D28D9')}
                >
                  <span>💬 Chat With Us</span>
                </a>
              </div>

              {/* Card 2: Customer Support Hours */}
              <div
                className="showcase-subcard showcase-hours-card"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6D28D9',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#18181B', margin: '0 0 8px' }}>
                    Customer Support Hours
                  </h4>
                  <div className="showcase-hours-grid" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#4B5563', gap: '8px' }}>
                      <span>Monday – Saturday:</span>
                      <span style={{ fontWeight: 700, color: '#18181B', whiteSpace: 'nowrap' }}>10:00 AM – 7:00 PM</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#4B5563', gap: '8px' }}>
                      <span>Sunday:</span>
                      <span style={{ fontWeight: 600, color: '#6B7280' }}>Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Already placed an order? */}
              <div
                className="showcase-subcard showcase-order-card"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="showcase-subcard-header" style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#FAF5FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6D28D9',
                      flexShrink: 0,
                    }}
                  >
                    <Package size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#18181B', margin: '0 0 2px' }}>
                      Already placed an order?
                    </h4>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      Need help with delivery, tracking or returns?
                    </p>
                  </div>
                </div>

                <Link
                  href="/track-order"
                  className="showcase-action-btn showcase-track-btn"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D8B4FE',
                    color: '#6D28D9',
                    padding: '8px 14px',
                    borderRadius: '9px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#6D28D9';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = '#6D28D9';
                  }}
                >
                  <span>Track Your Order</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Bottom Visual Pendant Box Image */}
              <div
                className="showcase-pendant-wrapper"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  marginTop: '4px',
                  boxShadow: '0 10px 25px rgba(109, 40, 217, 0.1)',
                }}
              >
                <img
                  src="/images/contact/contact-pendant-box.jpg"
                  alt="ThePurple Signature Pendant"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(20, 5, 40, 0.5) 0%, rgba(20, 5, 40, 0.1) 40%, transparent 80%)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  className="showcase-pendant-script"
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    right: '18px',
                    fontFamily: "var(--font-script, 'Caveat', cursive)",
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(109, 40, 217, 0.8)',
                    lineHeight: 1.15,
                    textAlign: 'right',
                  }}
                >
                  Here For Your
                  <br />
                  Every Moment ♡
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. COME SAY HELLO (STORE LOCATION & BOUTIQUE PHOTO) ────────── */}
        <section
          id="location-section"
          style={{
            maxWidth: '1420px',
            margin: '0 auto 70px auto',
            padding: '0 24px',
          }}
        >
          {/* Section Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                fontSize: 'clamp(24px, 3.2vw, 32px)',
                fontWeight: 800,
                color: '#18181B',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em',
              }}
            >
              Come Say Hello
            </h2>
            <p
              style={{
                fontSize: '14.5px',
                color: '#5F5A6B',
                margin: 0,
                fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              We&apos;d love to welcome you to our world.
            </p>
          </div>

          {/* 3-Column Split Container */}
          <div
            className="contact-location-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.45fr 1fr 1fr',
              gap: '24px',
              alignItems: 'stretch',
            }}
          >
            {/* 1. Interactive Stylized Map */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #EDE8F7',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(109, 40, 217, 0.04)',
                position: 'relative',
                minHeight: '300px',
              }}
            >
              <iframe
                title="ThePurple Mumbai Boutique Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.756285493922!2d72.85324547596008!3d19.118318850654634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c83c272584e9%3A0xc3f3458bfb511394!2sAndheri%20East%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '320px', display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Overlay Location Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #E9D5FF',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#6D28D9',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={13} />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#18181B' }}>ThePurple</div>
                  <div style={{ fontSize: '10.5px', color: '#6B7280' }}>Mumbai, Maharashtra</div>
                </div>
              </div>
            </div>

            {/* 2. Middle Details Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #EDE8F7',
                padding: '28px 24px',
                boxShadow: '0 4px 20px rgba(109, 40, 217, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#6D28D9',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                  }}
                >
                  OUR LOCATION
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#18181B',
                    margin: '0 0 16px 0',
                  }}
                >
                  ThePurple
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#4B5563' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <MapPin size={16} color="#6D28D9" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ lineHeight: 1.45 }}>123, Purple Street, Andheri East, Mumbai, Maharashtra - 400001</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={16} color="#6D28D9" style={{ flexShrink: 0 }} />
                    <a href="tel:+919876543210" style={{ color: '#18181B', fontWeight: 600, textDecoration: 'none' }}>
                      +91 98765 43210
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={16} color="#6D28D9" style={{ flexShrink: 0 }} />
                    <a href="mailto:support@thepurple.com" style={{ color: '#18181B', fontWeight: 600, textDecoration: 'none' }}>
                      support@thepurple.com
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Clock size={16} color="#6D28D9" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '12.5px', lineHeight: 1.45 }}>
                      <div>Mon – Sat: 10:00 AM – 7:00 PM</div>
                      <div style={{ color: '#8B8795' }}>Sunday: Closed</div>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=ThePurple+Jewellery+Mumbai"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: '24px',
                  backgroundColor: '#6D28D9',
                  color: '#FFFFFF',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5B21B6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Get Directions</span>
                <Navigation size={15} />
              </a>
            </div>

            {/* 3. Right Boutique Store Interior Photo */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #EDE8F7',
                padding: '14px',
                boxShadow: '0 4px 20px rgba(109, 40, 217, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  backgroundColor: '#FAF5FF',
                }}
              >
                <img
                  src="/images/contact/contact-boutique-store.jpg"
                  alt="ThePurple Flagship Boutique Store Mumbai"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: '12.5px',
                  color: '#5F5A6B',
                  textAlign: 'center',
                  margin: '12px 0 4px',
                  fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                Visit us and explore our exclusive collection in person.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 5. LOOKING FOR A QUICK ANSWER? (FAQ SECTION) ───────────────── */}
        <section
          style={{
            maxWidth: '1420px',
            margin: '0 auto 80px auto',
            padding: '0 24px',
          }}
        >
          {/* Header Bar with View All FAQs button */}
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
              <h2
                style={{
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                  fontSize: 'clamp(24px, 3.2vw, 32px)',
                  fontWeight: 800,
                  color: '#18181B',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Looking for a Quick Answer?
              </h2>
              <p
                style={{
                  fontSize: '14.5px',
                  color: '#5F5A6B',
                  margin: 0,
                  fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                You may find what you&apos;re looking for in our frequently asked questions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('contact-form-section')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E9D5FF',
                color: '#6D28D9',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FAF5FF';
                e.currentTarget.style.borderColor = '#6D28D9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E9D5FF';
              }}
            >
              <span>View All FAQs</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Grid: Left Gift Illustration Card + Right FAQ Rows */}
          <div
            className="contact-faq-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.65fr',
              gap: '32px',
              alignItems: 'start',
            }}
          >
            {/* Left: Still Need Help Card */}
            <div
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #F9F4FF 0%, #EDE4FF 100%)',
                border: '1.5px solid #E8DEFA',
                padding: '32px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(109, 40, 217, 0.04)',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '110px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  marginBottom: '18px',
                  boxShadow: '0 8px 20px rgba(109, 40, 217, 0.12)',
                }}
              >
                <img
                  src="/images/contact/contact-hero-giftbox.jpg"
                  alt="ThePurple Concierge Support"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#18181B',
                  margin: '0 0 6px 0',
                }}
              >
                Still need Help?
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#5F5A6B',
                  margin: '0 0 20px 0',
                  maxWidth: '240px',
                  lineHeight: 1.5,
                }}
              >
                Our support team is just a message away.
              </p>

              <button
                type="button"
                onClick={() => scrollToSection('contact-form-section')}
                style={{
                  padding: '11px 24px',
                  borderRadius: '10px',
                  backgroundColor: '#6D28D9',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5B21B6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Contact Support
              </button>
            </div>

            {/* Right: 5 FAQ Accordion Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: isOpen ? '1.5px solid #C4B5FD' : '1px solid #EDE8F7',
                      boxShadow: isOpen
                        ? '0 6px 18px rgba(109, 40, 217, 0.07)'
                        : '0 2px 6px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#18181B' }}>
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={17}
                        color="#6D28D9"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s ease',
                          flexShrink: 0,
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          padding: '0 20px 16px',
                          fontSize: '13.5px',
                          lineHeight: 1.6,
                          color: '#5F5A6B',
                          borderTop: '1px solid #FAF5FF',
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 6. SERVICE ASSURANCE STRIP ─────────────────────────────────── */}
        <BenefitsStrip />
      </main>

      {/* ─── 7. GLOBAL FOOTER ────────────────────────────────────────────── */}
      <Footer />

      {/* Responsive Styles */}
      <style jsx global>{`
        @media (max-width: 1080px) {
          .contact-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .contact-form-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .contact-location-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .contact-location-grid > div:first-child {
            grid-column: 1 / -1 !important;
          }
          .contact-faq-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }

        @media (max-width: 768px) {
          .contact-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            text-align: center !important;
          }
          .contact-hero-text {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .contact-hero-text p {
            margin: 0 auto 24px auto !important;
          }
          .contact-hero-script {
            display: none !important;
          }
          .contact-hero-image-wrapper {
            order: -1;
          }
          .contact-location-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-form-row {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .contact-showcase-card {
            padding: 16px !important;
            border-radius: 20px !important;
            gap: 12px !important;
          }
          .showcase-subcard {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 14px 16px !important;
            gap: 12px !important;
          }
          .showcase-subcard-header {
            width: 100% !important;
          }
          .showcase-action-btn {
            width: 100% !important;
            text-align: center !important;
            padding: 10px 16px !important;
            box-sizing: border-box !important;
          }
          .showcase-hours-card {
            flex-direction: row !important;
            align-items: flex-start !important;
          }
          .showcase-hours-grid > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 2px !important;
          }
          .showcase-pendant-wrapper {
            height: 190px !important;
          }
          .showcase-pendant-script {
            font-size: 20px !important;
            bottom: 12px !important;
            right: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
