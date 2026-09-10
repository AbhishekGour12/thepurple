'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Gem,
  Gift,
  Heart,
  Tag,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

const CATEGORY_ICONS = [Gem, Gift, Sparkles, Heart, ShoppingBag, Tag, Layers];

export default function AllCategoriesModal({
  isOpen,
  onClose,
  categories = [],
  onSelectCategory,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on Escape key press and manage body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus search on open
    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      clearTimeout(timeout);
    };
  }, [isOpen, onClose]);

  // Filter categories and subcategories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();

    return categories
      .map((cat) => {
        const matchesCat =
          cat.name?.toLowerCase().includes(q) ||
          cat.description?.toLowerCase().includes(q) ||
          cat.slug?.toLowerCase().includes(q);

        const matchingSubcategories = (cat.subcategories || []).filter(
          (sub) =>
            sub.name?.toLowerCase().includes(q) ||
            sub.description?.toLowerCase().includes(q) ||
            sub.slug?.toLowerCase().includes(q)
        );

        if (matchesCat || matchingSubcategories.length > 0) {
          return {
            ...cat,
            // If searching, prioritize matching subcategories
            filteredSubcategories: matchesCat
              ? cat.subcategories || []
              : matchingSubcategories,
            isDirectMatch: matchesCat,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [categories, searchQuery]);

  // Reset selected category index if filtered list changes
  useEffect(() => {
    setSelectedCategoryIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  const currentCategory = filteredCategories[selectedCategoryIndex] || filteredCategories[0];
  const totalSubcategories = categories.reduce(
    (acc, cat) => acc + (cat.subcategories?.length || 0),
    0
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 7, 34, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'allCategoriesFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-label="All Categories & Collections"
    >
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(93, 27, 168, 0.35), 0 0 0 1px rgba(109, 40, 217, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'allCategoriesSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid #F3E8FF',
            background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7E22CE 0%, #581C87 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
              }}
            >
              <Layers size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#1E1B4B',
                    fontFamily: 'inherit',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Explore All Categories
                </h2>
                <span
                  style={{
                    backgroundColor: '#FAF5FF',
                    color: '#7E22CE',
                    border: '1px solid #E9D5FF',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {categories.length} Categories • {totalSubcategories} Collections
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6B7280' }}>
                Discover our handcrafted jewelry, adorable plushies, luxury gift hampers & more
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: '#F3E8FF',
              color: '#6D28D9',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E9D5FF';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3E8FF';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid #F3E8FF', backgroundColor: '#FFFFFF' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                color: '#9333EA',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, e.g. Jewellery, Necklaces, Teddy Bears, Gifts, Bangles..."
              style={{
                width: '100%',
                padding: '12px 42px 12px 46px',
                borderRadius: '14px',
                border: '1.5px solid #E9D5FF',
                backgroundColor: '#FAF5FF',
                fontSize: '14px',
                fontWeight: 500,
                color: '#1E1B4B',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7E22CE';
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.boxShadow = '0 0 0 4px rgba(147, 51, 234, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E9D5FF';
                e.target.style.backgroundColor = '#FAF5FF';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Split Navigation / Grid View */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            minHeight: '440px',
            maxHeight: 'calc(90vh - 200px)',
            overflow: 'hidden',
          }}
        >
          {filteredCategories.length === 0 ? (
            /* Empty State */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  backgroundColor: '#FAF5FF',
                  border: '1px dashed #C084FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9333EA',
                  marginBottom: '16px',
                }}
              >
                <Search size={28} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1E1B4B', margin: '0 0 6px' }}>
                No categories found matching &ldquo;{searchQuery}&rdquo;
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px', maxWidth: '360px' }}>
                Try searching for general terms like &ldquo;Jewellery&rdquo;, &ldquo;Earrings&rdquo;, &ldquo;Chains&rdquo;, or clear the search.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <>
              {/* Left Column: Category List / Selector */}
              <div
                className="custom-scrollbar"
                style={{
                  width: '320px',
                  borderRight: '1px solid #F3E8FF',
                  backgroundColor: '#FCFBFE',
                  overflowY: 'auto',
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    padding: '8px 12px 6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#9333EA',
                  }}
                >
                  Categories ({filteredCategories.length})
                </div>

                {filteredCategories.map((cat, idx) => {
                  const isSelected = idx === selectedCategoryIndex;
                  const IconComponent = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
                  const subCount = (cat.filteredSubcategories || cat.subcategories || []).length;

                  return (
                    <button
                      key={cat.id || idx}
                      type="button"
                      onClick={() => setSelectedCategoryIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #C084FC' : '1px solid transparent',
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                        boxShadow: isSelected ? '0 4px 12px rgba(126, 34, 206, 0.08)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#F5EDFD';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E9D5FF',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              backgroundColor: isSelected ? '#7E22CE' : '#F3E8FF',
                              color: isSelected ? '#FFFFFF' : '#7E22CE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <IconComponent size={16} />
                          </div>
                        )}
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: isSelected ? 700 : 600,
                              color: isSelected ? '#1E1B4B' : '#374151',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                            {subCount} subcategories
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {cat.isFeatured && (
                          <span
                            title="Featured in Navigation Tabs"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: '#FAF5FF',
                              border: '1px solid #E9D5FF',
                              color: '#7E22CE',
                            }}
                          >
                            <Sparkles size={10} color="#7E22CE" />
                          </span>
                        )}
                        <ChevronRight
                          size={15}
                          style={{
                            color: isSelected ? '#7E22CE' : '#CBD5E1',
                            transition: 'transform 0.15s ease',
                            transform: isSelected ? 'translateX(2px)' : 'none',
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Active Category Subcategories & Details */}
              <div
                className="custom-scrollbar"
                style={{
                  flex: 1,
                  padding: '24px 28px',
                  overflowY: 'auto',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {currentCategory ? (
                  <>
                    {/* Category Title Banner */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        paddingBottom: '18px',
                        borderBottom: '1px solid #F3E8FF',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '22px',
                              fontWeight: 800,
                              color: '#1E1B4B',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {currentCategory.name}
                          </h3>
                          {currentCategory.isFeatured && (
                            <span
                              style={{
                                padding: '3px 9px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: '#FAF5FF',
                                color: '#7E22CE',
                                border: '1px solid #E9D5FF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Sparkles size={11} color="#7E22CE" />
                              Featured Nav Tab
                            </span>
                          )}
                        </div>
                        {currentCategory.description && (
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280', maxWidth: '520px' }}>
                            {currentCategory.description}
                          </p>
                        )}
                      </div>

                      {onSelectCategory ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCategory(currentCategory.name);
                            onClose();
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            backgroundColor: '#6D28D9',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(109, 40, 217, 0.2)',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#581C87')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6D28D9')}
                        >
                          <span>Filter by {currentCategory.name}</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <Link
                          href={`/category/${currentCategory.slug}`}
                          onClick={onClose}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            backgroundColor: '#6D28D9',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 4px 10px rgba(109, 40, 217, 0.2)',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#581C87')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6D28D9')}
                        >
                          <span>View All {currentCategory.name}</span>
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>

                    {/* Subcategories Grid */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: '#9333EA',
                          marginBottom: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Layers size={14} />
                        <span>
                          Subcategories & Collections (
                          {(currentCategory.filteredSubcategories || currentCategory.subcategories || []).length})
                        </span>
                      </div>

                      {!(currentCategory.filteredSubcategories || currentCategory.subcategories)?.length ? (
                        <div
                          style={{
                            padding: '36px 20px',
                            textAlign: 'center',
                            backgroundColor: '#FAF5FF',
                            borderRadius: '16px',
                            border: '1px dashed #E9D5FF',
                            color: '#6B7280',
                          }}
                        >
                          <p style={{ fontSize: '13px', margin: 0 }}>
                            No specific subcategories listed for this category.
                          </p>
                          {onSelectCategory ? (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCategory(currentCategory.name);
                                onClose();
                              }}
                              style={{
                                display: 'inline-block',
                                marginTop: '10px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#7E22CE',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Explore {currentCategory.name} products directly →
                            </button>
                          ) : (
                            <Link
                              href={`/category/${currentCategory.slug}`}
                              onClick={onClose}
                              style={{
                                display: 'inline-block',
                                marginTop: '10px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#7E22CE',
                                textDecoration: 'none',
                              }}
                            >
                              Explore {currentCategory.name} products directly →
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '12px',
                          }}
                        >
                          {(currentCategory.filteredSubcategories || currentCategory.subcategories || []).map(
                            (sub, sIdx) => {
                              const cardContent = (
                                <>
                                  <div>
                                    <div
                                      style={{
                                        fontSize: '13.5px',
                                        fontWeight: 700,
                                        color: '#1E1B4B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      <span>{sub.name}</span>
                                      <ChevronRight size={14} color="#7E22CE" />
                                    </div>
                                    {sub.description && (
                                      <div
                                        style={{
                                          fontSize: '11.5px',
                                          color: '#6B7280',
                                          marginTop: '4px',
                                          lineHeight: 1.3,
                                        }}
                                      >
                                        {sub.description}
                                      </div>
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      color: '#7E22CE',
                                      marginTop: '10px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span>{onSelectCategory ? 'Filter Products' : 'Browse Collection'}</span>
                                    <ExternalLink size={10} />
                                  </div>
                                </>
                              );

                              const cardStyle = {
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                borderRadius: '14px',
                                backgroundColor: '#FAF5FF',
                                border: '1px solid #E9D5FF',
                                textDecoration: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              };

                              if (onSelectCategory) {
                                return (
                                  <button
                                    key={sub.id || sIdx}
                                    type="button"
                                    onClick={() => {
                                      onSelectCategory(currentCategory.name, sub.name);
                                      onClose();
                                    }}
                                    style={cardStyle}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                                      e.currentTarget.style.borderColor = '#7E22CE';
                                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(126, 34, 206, 0.12)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#FAF5FF';
                                      e.currentTarget.style.borderColor = '#E9D5FF';
                                      e.currentTarget.style.boxShadow = 'none';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    {cardContent}
                                  </button>
                                );
                              }

                              return (
                                <Link
                                  key={sub.id || sIdx}
                                  href={`/category/${currentCategory.slug}?subcategory=${sub.slug}`}
                                  onClick={onClose}
                                  style={cardStyle}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                                    e.currentTarget.style.borderColor = '#7E22CE';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(126, 34, 206, 0.12)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FAF5FF';
                                    e.currentTarget.style.borderColor = '#E9D5FF';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                >
                                  {cardContent}
                                </Link>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Quick Strip */}
        <div
          style={{
            padding: '14px 28px',
            borderTop: '1px solid #F3E8FF',
            backgroundColor: '#FCFBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Popular Quick Links:</span>
            <Link
              href="/new-arrivals"
              onClick={onClose}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#7E22CE',
                backgroundColor: '#FAF5FF',
                padding: '3px 10px',
                borderRadius: '8px',
                textDecoration: 'none',
                border: '1px solid #E9D5FF',
              }}
            >
              ✨ New Arrivals
            </Link>
            <Link
              href="/best-sellers"
              onClick={onClose}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#7E22CE',
                backgroundColor: '#FAF5FF',
                padding: '3px 10px',
                borderRadius: '8px',
                textDecoration: 'none',
                border: '1px solid #E9D5FF',
              }}
            >
              🔥 Best Sellers
            </Link>
            <Link
              href="/offers"
              onClick={onClose}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                padding: '3px 10px',
                borderRadius: '8px',
                textDecoration: 'none',
                border: '1px solid #FECACA',
              }}
            >
              🏷️ Offers & Discounts
            </Link>
          </div>

          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
            Press <kbd style={{ backgroundColor: '#F3E8FF', color: '#581C87', padding: '1px 5px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>ESC</kbd> to close
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes allCategoriesFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes allCategoriesSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F8F5FC;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D8B4FE;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A855F7;
        }
      `}</style>
    </div>
  );
}
