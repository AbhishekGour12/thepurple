'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Check, HeartHandshake } from 'lucide-react';
import { isProductLocallyInterested, deleteInterest } from '@/lib/api/interests';
import InterestModal from './InterestModal';

export default function InterestButton({
  product,
  variant = 'button', // 'button' | 'badge' | 'icon'
  customStyle = {},
  className = '',
  onStateChange,
}) {
  const [isInterested, setIsInterested] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!product?.id) return;

    const checkState = () => {
      setIsInterested(isProductLocallyInterested(product.id));
    };

    checkState();

    window.addEventListener('thepurple_interests_updated', checkState);
    return () => {
      window.removeEventListener('thepurple_interests_updated', checkState);
    };
  }, [product?.id]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInterested) {
      // If already interested, toggle removal or prompt
      deleteInterest(null, product.id);
      setIsInterested(false);
      if (onStateChange) onStateChange(false);
    } else {
      // Open modal to capture inquiry details
      setIsModalOpen(true);
    }
  };

  const handleInterestRecorded = () => {
    setIsInterested(true);
    if (onStateChange) onStateChange(true);
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          aria-label={isInterested ? 'Remove Interest' : 'Express Interest'}
          title={isInterested ? 'Interested ✓' : "I'm Interested"}
          className={`interest-btn-icon ${className}`}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isInterested ? '#7E22CE' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            border: `1.5px solid ${isInterested ? '#7E22CE' : '#E9D5FF'}`,
            color: isInterested ? '#FFFFFF' : '#7E22CE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            ...customStyle,
          }}
        >
          {isInterested ? <Check size={16} strokeWidth={2.5} /> : <Sparkles size={15} />}
        </button>

        <InterestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          onInterestRecorded={handleInterestRecorded}
        />
      </>
    );
  }

  if (variant === 'badge') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`interest-btn-badge ${className}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: isInterested ? '#7E22CE' : '#FAF5FF',
            color: isInterested ? '#FFFFFF' : '#7E22CE',
            border: `1px solid ${isInterested ? '#7E22CE' : '#E9D5FF'}`,
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            ...customStyle,
          }}
        >
          {isInterested ? <Check size={12} strokeWidth={2.5} /> : <Sparkles size={12} />}
          <span>{isInterested ? 'Interested' : "I'm Interested"}</span>
        </button>

        <InterestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          onInterestRecorded={handleInterestRecorded}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`interest-btn-main ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '10px',
          backgroundColor: isInterested ? '#FAF5FF' : '#FFFFFF',
          color: isInterested ? '#7E22CE' : '#4B5563',
          border: `1.5px solid ${isInterested ? '#7E22CE' : '#E5E7EB'}`,
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          ...customStyle,
        }}
        onMouseEnter={(e) => {
          if (!isInterested) {
            e.currentTarget.style.borderColor = '#7E22CE';
            e.currentTarget.style.color = '#7E22CE';
            e.currentTarget.style.backgroundColor = '#FAF5FF';
          }
        }}
        onMouseLeave={(e) => {
          if (!isInterested) {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#4B5563';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }
        }}
      >
        {isInterested ? (
          <>
            <Check size={14} strokeWidth={2.5} color="#7E22CE" />
            <span style={{ color: '#7E22CE' }}>Interested</span>
          </>
        ) : (
          <>
            <Sparkles size={13} color="#7E22CE" />
            <span>I'm Interested</span>
          </>
        )}
      </button>

      <InterestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        onInterestRecorded={handleInterestRecorded}
      />
    </>
  );
}
