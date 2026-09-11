'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  X,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { expressInterest } from '@/lib/api/interests';

const QUICK_INQUIRY_CHIPS = [
  '💬 Check Availability',
  '✨ Custom Size / Weight Inquiry',
  '🎁 Luxury Gift Packaging Inquiry',
  '🏷️ Best Festive Price Quote',
  '👑 Book Storefront Viewing',
];

export default function InterestModal({ isOpen, onClose, product, onInterestRecorded }) {
  const customerUser = useSelector((state) => state.auth?.customer?.user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill fields whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setErrorMessage('');
      setLoading(false);

      if (customerUser) {
        setName(customerUser.name || '');
        setEmail(customerUser.email || '');
        setPhone(customerUser.phone || '');
      } else if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('thepurple_guest_contact');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.name) setName(parsed.name);
            if (parsed.email) setEmail(parsed.email);
            if (parsed.phone) setPhone(parsed.phone);
          }
        } catch {}
      }
    }
  }, [isOpen, customerUser]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await expressInterest({
        product,
        productId: product.id,
        name: name.trim() || customerUser?.name || 'Valued Customer',
        email: email.trim() || customerUser?.email,
        phone: phone.trim() || customerUser?.phone,
        note: note.trim(),
        source: 'INTEREST_MODAL',
      });

      setSuccess(true);
      if (onInterestRecorded) onInterestRecorded(product);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit interest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText) => {
    setNote((prev) => {
      if (!prev) return chipText;
      if (prev.includes(chipText)) return prev;
      return `${prev}\n• ${chipText}`;
    });
  };

  const formatPrice = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const primaryImage =
    product.image ||
    product.imageUrl ||
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.imageUrl ||
    product.images?.[0]?.url ||
    '/images/storefront/prod-gold-rope.jpg';

  return (
    <div
      className="interest-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 7, 34, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        animation: 'interestModalFade 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="interest-modal-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(76, 29, 149, 0.25), 0 0 0 1px rgba(109, 40, 217, 0.1)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px 18px',
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            borderBottom: '1.5px solid #E9D5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(126, 34, 206, 0.3)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#1E1B4B',
                  margin: 0,
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                Express Product Interest
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                Save this heirloom piece &amp; get personalized concierge assistance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9D5FF',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1E1B4B';
              e.currentTarget.style.backgroundColor = '#FAF5FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6B7280';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {success ? (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  border: '2px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(5, 150, 105, 0.18)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h4
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#065F46',
                  margin: '0 0 8px',
                  fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                }}
              >
                Interest Saved Successfully!
              </h4>

              <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.5, margin: '0 0 20px' }}>
                We have added <strong>{product.name}</strong> to your <strong>My Interests</strong> collection.
                Our personal jewellery concierge will review your inquiry and connect with you shortly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/my-interests"
                  onClick={onClose}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#7E22CE',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>View in My Interests Page</span>
                  <ArrowRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    color: '#6D28D9',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <form onSubmit={handleSubmit}>
              {/* Product Preview Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E9D5FF',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={primaryImage}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1E1B4B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {product.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#7E22CE' }}>
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.badge && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#7E22CE',
                          color: '#FFFFFF',
                        }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                    SKU: {product.sku || 'TP-JW-001'} • 100% Certified 22K Purity
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '10px',
                    color: '#DC2626',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    marginBottom: '14px',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {/* Input Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Your Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      style={inputStyle}
                    />
                    <User size={14} color="#9CA3AF" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Phone / WhatsApp *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={inputStyle}
                    />
                    <Phone size={14} color="#9CA3AF" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                  Email Address (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={inputStyle}
                  />
                  <Mail size={14} color="#9CA3AF" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Quick Inquiry Note Suggestions */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#6B7280', marginBottom: '6px' }}>
                  Quick Inquiry Tags (Tap to add):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_INQUIRY_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        backgroundColor: '#FAF5FF',
                        border: '1px solid #E9D5FF',
                        color: '#7E22CE',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
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
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Message Textarea */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                  Inquiry Note / Customization Request
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tell us what you would like to know (size availability, custom gold purity, delivery dates)..."
                  style={{
                    ...inputStyle,
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Trust Badge Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                  color: '#6B7280',
                  marginBottom: '18px',
                }}
              >
                <ShieldCheck size={15} color="#059669" />
                <span>Your details are 100% secure. Instant concierge response guaranteed.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7E22CE 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(126, 34, 206, 0.35)',
                  transition: 'all 0.15s ease',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Sparkles size={16} />
                <span>{loading ? 'Recording Interest...' : 'Confirm & Express Interest'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes interestModalFade {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1.5px solid #E5E7EB',
  backgroundColor: '#FAF5FF',
  fontSize: '13px',
  color: '#1E1B4B',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};
