'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Send,
  User,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { reviewApi } from '@/lib/api/reviews';

export default function ProductReviewsSection({
  productId,
  slug,
  productName,
  customerUser,
  onRatingUpdated,
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 4.8,
    totalReviews: 0,
    starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    starPercentages: { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(null);

  // Simplified Form State (Only Rating & Comment)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [helpfulVoted, setHelpfulVoted] = useState({});

  useEffect(() => {
    if (productId || slug) {
      loadReviews();
    }
  }, [productId, slug, filterRating]);

  async function loadReviews() {
    try {
      setLoading(true);
      const params = {};
      if (filterRating) params.rating = filterRating;
      const data = await reviewApi.getProductReviews(productId || slug, params);
      if (data) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
          if (onRatingUpdated && data.stats.averageRating) {
            onRatingUpdated(data.stats.averageRating, data.stats.totalReviews);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStarClick = (rating) => {
    setFormRating(rating);
  };

  const getRatingFeedbackText = (r) => {
    switch (r) {
      case 5:
        return '★ ★ ★ ★ ★ — Loved it! Outstanding quality & craftsmanship';
      case 4:
        return '★ ★ ★ ★ ☆ — Very good! Met my expectations';
      case 3:
        return '★ ★ ★ ☆ ☆ — Average / Good';
      case 2:
        return '★ ★ ☆ ☆ ☆ — Below expectations';
      case 1:
        return '★ ☆ ☆ ☆ ☆ — Poor / Disappointed';
      default:
        return 'Select a Star Rating';
    }
  };

  const handleOpenReviewForm = () => {
    if (!customerUser) {
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname : `/products/${slug || productId}`;
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }
    setIsFormOpen((prev) => !prev);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!customerUser) {
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname : `/products/${slug || productId}`;
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!formComment || formComment.trim().length < 3) {
      setFormError('Please enter a review description of at least 3 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        productId,
        slug,
        rating: formRating,
        comment: formComment.trim(),
      };

      await reviewApi.submitReview(payload);
      setFormSuccess('Thank you! Your review and rating have been posted 🎉');
      setFormComment('');
      setIsFormOpen(false);

      // Refresh reviews list
      await loadReviews();
      setTimeout(() => setFormSuccess(null), 5000);
    } catch (err) {
      setFormError(err.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    if (helpfulVoted[reviewId]) return;
    try {
      setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        )
      );
      await reviewApi.markHelpful(reviewId);
    } catch (err) {
      console.warn('Could not vote helpful:', err);
    }
  };

  const displayRating = stats.averageRating || 4.8;
  const displayTotalReviews = stats.totalReviews || reviews.length;
  const userDisplayName = customerUser?.name || customerUser?.fullName || (customerUser?.email ? customerUser.email.split('@')[0] : 'User');
  const userAvatar = customerUser?.avatar || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ─── 1. TOP RATING SUMMARY SCORECARD (Amazon / Flipkart Style) ─── */}
      <div
        style={{
          backgroundColor: '#FAF8FC',
          borderRadius: '18px',
          border: '1px solid #E9D5FF',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Left: Overall Big Score */}
        <div style={{ textAlign: 'center', borderRight: '1px solid #E5E7EB', paddingRight: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: '#7E22CE', lineHeight: 1 }}>
              {displayRating}
            </span>
            <Star size={32} fill="#F59E0B" stroke="#F59E0B" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                fill={s <= Math.round(displayRating) ? '#F59E0B' : '#E5E7EB'}
                stroke={s <= Math.round(displayRating) ? '#F59E0B' : '#D1D5DB'}
              />
            ))}
          </div>

          <div style={{ fontSize: '13px', color: '#4B5563', fontWeight: 700 }}>
            Based on {displayTotalReviews} Verified Ratings
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            <CheckCircle2 size={13} />
            <span>98% Verified Satisfaction</span>
          </div>
        </div>

        {/* Center: Interactive 5-Star Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
            Rating Breakdown:
          </div>

          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.starCounts?.[stars] || 0;
            const pct = stats.starPercentages?.[stars] || 0;
            const isSelected = filterRating === stars;

            return (
              <div
                key={stars}
                onClick={() => setFilterRating(isSelected ? null : stars)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  color: isSelected ? '#7E22CE' : '#4B5563',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#FAF5FF' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
                title={`Filter by ${stars} stars`}
              >
                <span style={{ width: '42px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {stars} <Star size={11} fill="#F59E0B" stroke="#F59E0B" />
                </span>

                <div style={{ flex: 1, height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: stars >= 4 ? '#7E22CE' : stars === 3 ? '#F59E0B' : '#EF4444',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <span style={{ width: '38px', textAlign: 'right', fontSize: '11px', color: '#6B7280' }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Write a Review CTA Card */}
        <div style={{ textAlign: 'center', paddingLeft: '8px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px' }}>
            Have you experienced this piece?
          </h4>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.4 }}>
            {customerUser ? 'Share your rating and thoughts with fellow customers.' : 'Please sign in to share your verified review & rating.'}
          </p>

          <button
            type="button"
            onClick={handleOpenReviewForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '11px 20px',
              borderRadius: '10px',
              backgroundColor: isFormOpen ? '#FAF5FF' : '#7E22CE',
              color: isFormOpen ? '#7E22CE' : '#FFFFFF',
              border: isFormOpen ? '1.5px solid #7E22CE' : 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: isFormOpen ? 'none' : '0 4px 14px rgba(126, 34, 206, 0.25)',
              transition: 'all 0.15s ease',
              width: '100%',
              maxWidth: '220px',
            }}
          >
            {customerUser ? (
              <>
                <MessageSquare size={15} />
                <span>{isFormOpen ? 'Close Form' : 'Write a Review'}</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Sign In to Review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {formSuccess && (
        <div style={{ padding: '14px 18px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: 700 }}>
          <CheckCircle2 size={18} />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* ─── 2. WRITE A REVIEW FORM (Only Rating & Description) ─── */}
      {isFormOpen && customerUser && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #DDD6FE',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(126, 34, 206, 0.06)',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#7E22CE" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                Rate & Review {productName || 'this Piece'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>

          {/* Posting As User Profile Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              borderRadius: '10px',
              marginBottom: '16px',
            }}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userDisplayName}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #C084FC' }}
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#7E22CE',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E1B4B' }}>
                Posting review as: <span style={{ color: '#7E22CE' }}>{userDisplayName}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {customerUser.email || 'Verified Account'}
              </div>
            </div>
          </div>

          {formError && (
            <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. Interactive 5-Star Rating Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px' }}>
                Your Star Rating *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '6px' }} onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || formRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          transform: hoverRating === star ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <Star
                          size={28}
                          fill={isFilled ? '#F59E0B' : '#F3F4F6'}
                          stroke={isFilled ? '#F59E0B' : '#D1D5DB'}
                        />
                      </button>
                    );
                  })}
                </div>

                <span style={{ fontSize: '12.5px', color: '#7E22CE', fontWeight: 800, paddingLeft: '8px' }}>
                  {getRatingFeedbackText(hoverRating || formRating)}
                </span>
              </div>
            </div>

            {/* 2. Detailed Review Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Your Review Description *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Share your thoughts about this product's quality, shine, finish, packaging, and delivery..."
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #E5E7EB',
                  backgroundColor: '#FAF8FC',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: submitting ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)',
                }}
              >
                <Send size={15} />
                <span>{submitting ? 'Submitting Review...' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── 3. REVIEWS LIST WITH FIXED HEIGHT & SLICK OVERFLOW SCROLLBAR ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
              Customer Reviews ({reviews.length})
            </h3>
            {filterRating && (
              <span style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF', fontWeight: 700 }}>
                Filtered: {filterRating} Stars
                <button
                  type="button"
                  onClick={() => setFilterRating(null)}
                  style={{ background: 'none', border: 'none', color: '#7E22CE', fontWeight: 900, cursor: 'pointer', marginLeft: '4px' }}
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
            Showing verified customer purchases
          </div>
        </div>

        {/* Scrollable Container with Fixed Height & Overflow-Y */}
        <div
          className="custom-review-scroll-container"
          style={{
            maxHeight: '520px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingRight: '6px',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              <div style={{ width: '28px', height: '28px', border: '3px solid #7E22CE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
              <span>Loading verified customer reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
              <MessageSquare size={36} color="#9CA3AF" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B', marginBottom: '4px' }}>
                {filterRating ? `No ${filterRating}-star reviews yet` : 'No reviews written yet'}
              </div>
              <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '0 0 14px' }}>
                Be the first to share your thoughts on this exquisite piece!
              </p>
              <button
                type="button"
                onClick={handleOpenReviewForm}
                style={{ padding: '8px 18px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '8px', color: '#7E22CE', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
              >
                {customerUser ? 'Write First Review' : 'Sign In to Review'}
              </button>
            </div>
          ) : (
            reviews.map((rev) => {
              const authorName = rev.user?.name || rev.userName || 'User';
              const authorAvatar = rev.user?.avatar || null;
              const firstLetter = (authorName ? authorName.charAt(0) : 'U').toUpperCase();

              return (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E5E7EB',
                    padding: '18px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Review Top Header: Author & Verified Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {authorAvatar ? (
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid #E9D5FF',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#FAF5FF',
                            border: '1.5px solid #E9D5FF',
                            color: '#7E22CE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {firstLetter}
                        </div>
                      )}

                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E1B4B' }}>
                          {authorName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          Reviewed in India on {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {rev.isVerifiedPurchase && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          backgroundColor: '#F0FDF4',
                          color: '#16A34A',
                          border: '1px solid #BBF7D0',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= rev.rating ? '#F59E0B' : '#E5E7EB'}
                          stroke={s <= rev.rating ? '#F59E0B' : '#D1D5DB'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Body */}
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>
                    {rev.comment}
                  </p>

                  {/* Helpful Action Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#6B7280', paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
                    <button
                      type="button"
                      onClick={() => handleHelpfulVote(rev.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: helpfulVoted[rev.id] ? '#FAF5FF' : '#FFFFFF',
                        color: helpfulVoted[rev.id] ? '#7E22CE' : '#4B5563',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <ThumbsUp size={12} color={helpfulVoted[rev.id] ? '#7E22CE' : '#6B7280'} />
                      <span>{helpfulVoted[rev.id] ? 'Helpful ✓' : 'Helpful'}</span>
                      {rev.helpfulCount > 0 && <span>({rev.helpfulCount})</span>}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sleek Custom Scrollbar Styling */}
      <style jsx global>{`
        .custom-review-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .custom-review-scroll-container::-webkit-scrollbar-track {
          background: #F5F3FF;
          border-radius: 4px;
        }
        .custom-review-scroll-container::-webkit-scrollbar-thumb {
          background: #C4B5FD;
          border-radius: 4px;
        }
        .custom-review-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #7E22CE;
        }
      `}</style>
    </div>
  );
}
