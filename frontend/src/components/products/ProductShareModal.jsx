"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  Mail,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function ProductShareModal({ isOpen, onClose, product }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = product?.slug
        ? `${window.location.origin}/products/${product.slug}`
        : window.location.href;
      setShareUrl(url);

      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        setCanNativeShare(true);
      }
    }
  }, [product]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const productName = product.name || 'Exclusive Product';
  const price = product.salePrice || product.price || 0;
  const mrp = product.price || 0;
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    '/images/storefront/hero-gold.jpg';

  // Pre-formatted messages for social platforms
  const shareMessage = `✨ *${productName}* ${
    price ? `at only *₹${price.toLocaleString('en-IN')}*!` : ''
  }\nExplore exclusive luxury collections on ThePurple.\n👉 ${shareUrl}`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  // Native share sheet (Android / iOS / macOS)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} on ThePurple!`,
          url: shareUrl,
        });
      } catch {
        // User dismissed
      }
    }
  };

  // Social sharing links
  const socialChannels = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bg: '#25D366',
      color: '#FFFFFF',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      bg: '#229ED9',
      color: '#FFFFFF',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
        `✨ Check out ${productName} on ThePurple!`
      )}`,
    },
    {
      name: 'Facebook',
      icon: ExternalLink,
      bg: '#1877F2',
      color: '#FFFFFF',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'X (Twitter)',
      icon: Sparkles,
      bg: '#0F1419',
      color: '#FFFFFF',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Check out ${productName} on ThePurple!`
      )}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      bg: '#EA4335',
      color: '#FFFFFF',
      href: `mailto:?subject=${encodeURIComponent(
        `Check out this on ThePurple: ${productName}`
      )}&body=${encodeURIComponent(shareMessage)}`,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'pdpFadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #F3E8FF',
          animation: 'pdpScaleUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #F3F4F6',
            backgroundColor: '#FAF5FF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EDE9FE',
                color: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1E1B4B' }}>
                Share with Friends
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>
                Share with image preview & price details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              backgroundColor: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Product Preview Card */}
        <div style={{ padding: '16px 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
              }}
            >
              <Image
                src={primaryImage}
                alt={productName}
                fill
                style={{ objectFit: 'cover' }}
                sizes="64px"
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#7E22CE',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {product.brand || 'ThePurple'}
              </div>
              <h4
                style={{
                  margin: '2px 0 4px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E1B4B',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={productName}
              >
                {productName}
              </h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B' }}>
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {mrp > price && (
                  <span style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                    ₹{mrp.toLocaleString('en-IN')}
                  </span>
                )}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  Image Preview Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Share Grid */}
        <div style={{ padding: '0 20px 16px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#4B5563',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '10px',
            }}
          >
            Direct Share via
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
            }}
          >
            {socialChannels.map((channel) => (
              <a
                key={channel.name}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  borderRadius: '10px',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: channel.bg,
                    color: channel.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                  }}
                >
                  <channel.icon size={20} />
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#374151', textAlign: 'center' }}>
                  {channel.name}
                </span>
              </a>
            ))}
          </div>

          {/* Native Device Share (Mobile Web Share Sheet) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FAF5FF',
                color: '#7E22CE',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Share2 size={14} />
              <span>More Options (Device Share Sheet)</span>
            </button>
          )}
        </div>

        {/* Copy Link Section */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: '#4B5563',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Or Copy Link
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '10px',
              padding: '4px 6px 4px 12px',
            }}
          >
            <input
              type="text"
              readOnly
              value={shareUrl}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                color: '#374151',
                backgroundColor: 'transparent',
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: copied ? '#059669' : '#7E22CE',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
