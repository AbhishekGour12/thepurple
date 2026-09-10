'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, Sparkles, ArrowRight, Grid, Check } from 'lucide-react';

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Chains', slug: 'chains', imageUrl: '/images/storefront/cat-chains.jpg', count: '48+ Designs' },
  { id: '2', name: 'Earrings', slug: 'earrings', imageUrl: '/images/storefront/cat-earrings.jpg', count: '36+ Designs' },
  { id: '3', name: 'Necklaces', slug: 'necklaces', imageUrl: '/images/storefront/cat-necklaces.jpg', count: '54+ Designs' },
  { id: '4', name: 'Bangles', slug: 'bangles', imageUrl: '/images/storefront/cat-bangles.jpg', count: '28+ Designs' },
  { id: '5', name: 'Rings', slug: 'rings', imageUrl: '/images/storefront/cat-rings.jpg', count: '42+ Designs' },
  { id: '6', name: 'Teddy Bears', slug: 'teddy-bears', imageUrl: '/images/storefront/cat-teddy.jpg', count: '24+ Combos' },
  { id: '7', name: 'Gifts & Hampers', slug: 'gifts', imageUrl: '/images/storefront/hero-gifts.jpg', count: '36+ Options' },
];

export default function CategoryGridModal({
  isOpen,
  onClose,
  categories = [],
  selectedCategory = null,
  onSelectCategory,
}) {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  const activeCategoriesList = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return activeCategoriesList;
    const q = search.toLowerCase().trim();
    return activeCategoriesList.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q)
    );
  }, [activeCategoriesList, search]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        backgroundColor: 'rgba(15, 7, 34, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'catModalFadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="cat-modal-dialog"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E9D5FF',
          boxShadow: '0 25px 60px rgba(15, 7, 34, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'catModalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          className="cat-modal-header"
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #F3E8FF',
            backgroundColor: '#FCFBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7E22CE',
                  flexShrink: 0,
                }}
              >
                <Grid size={15} />
              </div>
              <h2 className="cat-modal-title" style={{ fontSize: '19px', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                All Product Categories
              </h2>
            </div>
            <p className="cat-modal-subtitle" style={{ fontSize: '12.5px', color: '#6B7280', margin: '3px 0 0' }}>
              Tap any category to filter the catalog ({activeCategoriesList.length} categories)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3E8FF';
              e.currentTarget.style.color = '#7E22CE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FAF5FF';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Search Filter Strip */}
        <div className="cat-modal-search" style={{ padding: '12px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #F9FAFB' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category name..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1.5px solid #E9D5FF',
                backgroundColor: '#FAF5FF',
                fontSize: '13px',
                color: '#1E1B4B',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid Body */}
        <div
          className="cat-modal-body"
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 190px)',
            backgroundColor: '#FAFAF9',
          }}
        >
          {filteredCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: '#6B7280' }}>
              <p style={{ fontSize: '14px', margin: 0 }}>No categories found matching &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <div
              className="cat-modal-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '14px',
              }}
            >
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const fallbackImg = '/images/storefront/prod-gold-rope.jpg';
                const imgSrc = cat.imageUrl || cat.image || fallbackImg;

                return (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(cat.name);
                      }
                      onClose();
                    }}
                    className="modal-cat-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: isSelected ? '#FAF5FF' : '#FFFFFF',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #7E22CE' : '1px solid #E9D5FF',
                      overflow: 'hidden',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: isSelected
                        ? '0 8px 20px rgba(126, 34, 206, 0.15)'
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#C084FC';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 22px rgba(126, 34, 206, 0.12)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#E9D5FF';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      }
                    }}
                  >
                    {/* Image Area */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1 / 0.85',
                        backgroundColor: '#F5EDFD',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                        className="modal-cat-img"
                        onError={(e) => {
                          e.target.src = fallbackImg;
                        }}
                      />
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: '#7E22CE',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        >
                          <Check size={13} />
                        </div>
                      )}
                    </div>

                    {/* Category Label */}
                    <div style={{ padding: '10px 8px 12px', width: '100%', boxSizing: 'border-box' }}>
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: isSelected ? '#7E22CE' : '#1E1B4B',
                          lineHeight: 1.2,
                          marginBottom: '2px',
                        }}
                      >
                        {cat.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#9333EA',
                          fontWeight: 600,
                        }}
                      >
                        Select Category
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Strip */}
        <div
          className="cat-modal-footer"
          style={{
            padding: '12px 24px',
            backgroundColor: '#FCFBFE',
            borderTop: '1px solid #F3E8FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory(null);
              onClose();
            }}
            className="cat-modal-clear-btn"
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#6B7280',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7E22CE';
              e.currentTarget.style.color = '#7E22CE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            Show All Products (Clear Filter)
          </button>

          <div className="cat-modal-hint" style={{ fontSize: '12px', color: '#9CA3AF' }}>
            Clicking any category auto-scrolls to the catalog
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes catModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes catModalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        :global(.modal-cat-card:hover .modal-cat-img) {
          transform: scale(1.08);
        }
        @media (max-width: 640px) {
          .cat-modal-dialog {
            border-radius: 18px !important;
            max-height: 92vh !important;
          }
          .cat-modal-header {
            padding: 14px 16px 12px !important;
          }
          .cat-modal-title {
            font-size: 16px !important;
          }
          .cat-modal-subtitle {
            font-size: 11.5px !important;
          }
          .cat-modal-search {
            padding: 10px 16px !important;
          }
          .cat-modal-body {
            padding: 14px 16px !important;
            max-height: calc(92vh - 170px) !important;
          }
          .cat-modal-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .cat-modal-footer {
            padding: 10px 16px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .cat-modal-clear-btn {
            width: 100% !important;
            text-align: center !important;
            padding: 9px 14px !important;
          }
          .cat-modal-hint {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
