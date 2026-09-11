'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Check,
  RefreshCw,
  Tag,
} from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, removeWishlistProduct } from '@/store/slices/wishlistSlice';

export default function MyInterestsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items: interests, loading } = useSelector((state) => state.wishlist);
  const [deletingId, setDeletingId] = useState(null);
  const [cartFeedback, setCartFeedback] = useState({});

  const loadData = () => {
    dispatch(fetchWishlist());
  };

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (id, productId) => {
    setDeletingId(id || productId);
    try {
      await dispatch(removeWishlistProduct({ id, productId }));
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddToCart = (e, prodId) => {
    e.preventDefault();
    e.stopPropagation();
    setCartFeedback((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setCartFeedback((prev) => ({ ...prev, [prodId]: false }));
    }, 2000);
  };

  const formatPrice = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const getWhatsAppUrl = (product) => {
    const phone = '919876543210';
    const text = encodeURIComponent(
      `Hello ThePurple Concierge! ✨\nI am interested in buying/inquiring about:\n• Product: ${product.name}\n• Price: ₹${product.price}\n• SKU: ${product.sku || 'TP-JW'}\nCould you please help me with availability and shipping?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FCFBFE' }}>
      <AnnouncementBar />
      <MainHeader />

      <main style={{ flex: 1, maxWidth: '1380px', margin: '0 auto', width: '100%', padding: '36px 20px 60px' }}>
        {/* Page Header Banner */}
        <div
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)',
            border: '1.5px solid #E9D5FF',
            boxShadow: '0 10px 30px rgba(126, 34, 206, 0.05)',
            padding: 'clamp(24px, 4vw, 36px)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '18px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '20px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                color: '#7E22CE',
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}
            >
              <Heart size={14} color="#DC2626" fill="#DC2626" />
              <span>My Saved Collection</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(24px, 3.5vw, 32px)',
                fontWeight: 800,
                color: '#1E1B4B',
                margin: '0 0 6px',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                letterSpacing: '-0.02em',
              }}
            >
              My Interests & Wishlist
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', maxWidth: '620px', lineHeight: 1.5 }}>
              All your favorite jewellery pieces and celebration hampers saved in one place. Add them directly to your cart or chat with our luxury concierge.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '10px 20px',
                borderRadius: '14px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E9D5FF',
                boxShadow: '0 2px 8px rgba(126, 34, 206, 0.06)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#7E22CE' }}>
                {interests.length}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Saved Products</div>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              title="Refresh List"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E9D5FF',
                color: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={17} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6B7280' }}>
            <RefreshCw size={36} color="#7E22CE" style={{ margin: '0 auto 14px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E1B4B' }}>Loading Saved Products...</div>
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Fetching your personalized wishlist</div>
          </div>
        ) : interests.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid #F3E8FF',
              boxShadow: '0 10px 30px rgba(126, 34, 206, 0.04)',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: '#FAF5FF',
                border: '2px solid #E9D5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                margin: '0 auto 18px',
              }}
            >
              <Heart size={36} fill="#F87171" color="#DC2626" />
            </div>

            <h3
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#1E1B4B',
                margin: '0 0 8px',
                fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              }}
            >
              Your Wishlist & Interests are Empty
            </h3>

            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: '420px' }}>
              You haven’t saved any items yet. Click the <strong>Heart icon</strong> on any jewellery piece or hamper to add it to your saved interests!
            </p>

            <Link
              href="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 28px',
                borderRadius: '12px',
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(126, 34, 206, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <ShoppingBag size={16} />
              <span>Explore Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* Saved Products Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {interests.map((item) => {
              const prod = item.product || {};
              const isDeleting = deletingId === item.id || deletingId === item.productId;
              const isAdded = !!cartFeedback[prod.id || item.productId];

              return (
                <div
                  key={item.id || item.productId}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid #F3E8FF',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(126, 34, 206, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    opacity: isDeleting ? 0.4 : 1,
                  }}
                  className="saved-product-card"
                >
                  {/* Image & Badges */}
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#FAF5FF', overflow: 'hidden' }}>
                    <Link href={`/products/${prod.slug || prod.id}`}>
                      <img
                        src={prod.image || '/images/storefront/prod-gold-rope.jpg'}
                        alt={prod.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                        className="card-img"
                      />
                    </Link>

                    {/* Product Badge */}
                    {prod.badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          backgroundColor: prod.badgeColor || '#7E22CE',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                      >
                        {prod.badge}
                      </div>
                    )}

                    {/* Heart / Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.productId)}
                      title="Remove from Interests / Wishlist"
                      disabled={isDeleting}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                        transition: 'all 0.15s ease',
                      }}
                      className="remove-btn"
                    >
                      <Heart size={16} fill="#DC2626" color="#DC2626" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#7E22CE',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '4px',
                      }}
                    >
                      {prod.category || 'Fine Jewellery'}
                    </div>

                    <Link
                      href={`/products/${prod.slug || prod.id}`}
                      style={{
                        textDecoration: 'none',
                        color: '#1E1B4B',
                        marginBottom: '10px',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          lineHeight: 1.35,
                          margin: 0,
                          fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
                        }}
                      >
                        {prod.name}
                      </h4>
                    </Link>

                    {/* Price & Discount */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '17px', fontWeight: 800, color: '#7E22CE' }}>
                        {formatPrice(prod.price)}
                      </span>
                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <span style={{ fontSize: '13px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                          {formatPrice(prod.originalPrice)}
                        </span>
                      )}
                      {prod.discount > 0 && prod.originalPrice && prod.originalPrice > prod.price && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#059669',
                            backgroundColor: '#ECFDF5',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            marginLeft: 'auto',
                          }}
                        >
                          {prod.discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod.id || item.productId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '12px',
                          backgroundColor: isAdded ? '#059669' : '#7E22CE',
                          color: '#FFFFFF',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: isAdded
                            ? '0 3px 10px rgba(5, 150, 105, 0.3)'
                            : '0 3px 10px rgba(126, 34, 206, 0.25)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isAdded ? (
                          <>
                            <Check size={16} />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={15} />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      {/* WhatsApp Concierge */}
                      <a
                        href={getWhatsAppUrl(prod)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          color: '#16A34A',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <MessageCircle size={14} />
                        <span>Inquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        .saved-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(126, 34, 206, 0.12) !important;
          border-color: #D8B4FE !important;
        }
        .saved-product-card:hover .card-img {
          transform: scale(1.04);
        }
        .remove-btn:hover {
          transform: scale(1.15);
          background-color: #FEE2E2 !important;
        }
      `}</style>
    </div>
  );
}
