'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Filter,
  RotateCcw,
  Tag,
  Layers,
  DollarSign,
  Package,
  Calendar,
  Sparkles,
  Award,
  Box,
  Check,
  ChevronDown,
} from 'lucide-react';

export default function ProductFilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  categories = [],
  subcategories = [],
  onCategoryChange,
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleResetLocal = () => {
    const defaultState = {
      search: localFilters.search || '',
      categoryId: '',
      subcategoryId: '',
      status: '',
      stockStatus: '',
      minStock: '',
      maxStock: '',
      minPrice: '',
      maxPrice: '',
      minDiscount: '',
      maxDiscount: '',
      brand: '',
      isFeatured: '',
      isBestSeller: '',
      isBulk: '',
      tags: '',
      startDate: '',
      endDate: '',
      sort: 'newest',
    };
    setLocalFilters(defaultState);
    if (onReset) onReset();
  };

  // Calculate active filter count
  const activeCount = Object.entries(localFilters).filter(([k, v]) => {
    if (k === 'search' || k === 'sort') return false;
    return v !== '' && v !== undefined && v !== null;
  }).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out forwards',
        }}
      />

      {/* Drawer Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-8px 0 30px rgba(76, 29, 149, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E8E1F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAF8FC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EDE9FE',
                color: '#6D28D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Filter size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#18181B' }}>
                Filter Products
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {activeCount > 0 ? (
                  <span style={{ color: '#6D28D9', fontWeight: 600 }}>
                    {activeCount} active filter{activeCount > 1 ? 's' : ''} applied
                  </span>
                ) : (
                  'Refine catalog by every attribute'
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={handleResetLocal}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#DC2626',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* 1. Category & Subcategory */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <Layers size={15} color="#6D28D9" />
              <span>Category & Subcategory</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div>
                <label style={labelStyle}>Primary Category</label>
                <select
                  value={localFilters.categoryId || ''}
                  onChange={(e) => {
                    handleChange('categoryId', e.target.value);
                    if (onCategoryChange) onCategoryChange(e.target.value);
                  }}
                  style={inputStyle}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {localFilters.categoryId && (
                <div>
                  <label style={labelStyle}>Subcategory</label>
                  <select
                    value={localFilters.subcategoryId || ''}
                    onChange={(e) => handleChange('subcategoryId', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">All Subcategories in this category</option>
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 2. Status & Special Badges */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <Sparkles size={15} color="#6D28D9" />
              <span>Status & Badges</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Publication Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                {[
                  { id: '', label: 'All' },
                  { id: 'PUBLISHED', label: '● Live' },
                  { id: 'DRAFT', label: '○ Draft' },
                ].map((st) => {
                  const isSelected = localFilters.status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleChange('status', st.id)}
                      style={{
                        padding: '7px 8px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #6D28D9' : '1px solid #E5E7EB',
                        backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                        color: isSelected ? '#6D28D9' : '#374151',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Attribute Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
              <label style={labelStyle}>Product Highlights</label>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={localFilters.isFeatured === 'true'}
                  onChange={(e) => handleChange('isFeatured', e.target.checked ? 'true' : '')}
                  style={checkboxStyle}
                />
                <Sparkles size={14} color="#7C3AED" />
                <span style={{ fontSize: '13px', color: '#1F2937', fontWeight: 500 }}>
                  Featured Products Only
                </span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={localFilters.isBestSeller === 'true'}
                  onChange={(e) => handleChange('isBestSeller', e.target.checked ? 'true' : '')}
                  style={checkboxStyle}
                />
                <Award size={14} color="#D97706" />
                <span style={{ fontSize: '13px', color: '#1F2937', fontWeight: 500 }}>
                  Best Seller Products
                </span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={localFilters.isBulk === 'true'}
                  onChange={(e) => handleChange('isBulk', e.target.checked ? 'true' : '')}
                  style={checkboxStyle}
                />
                <Box size={14} color="#059669" />
                <span style={{ fontSize: '13px', color: '#1F2937', fontWeight: 500 }}>
                  Bulk Wholesale (MOQ) Products
                </span>
              </label>
            </div>
          </div>

          {/* 3. Pricing & Discounts */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <DollarSign size={15} color="#6D28D9" />
              <span>Price Range & Discount</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
              <div>
                <label style={labelStyle}>Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="₹ 0"
                  value={localFilters.minPrice || ''}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="₹ 50,000+"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Quick Price Range Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {[
                { label: 'Under ₹1,000', min: '', max: '1000' },
                { label: '₹1K - ₹5K', min: '1000', max: '5000' },
                { label: '₹5K - ₹15K', min: '5000', max: '15000' },
                { label: '₹15K+', min: '15000', max: '' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleChange('minPrice', chip.min);
                    handleChange('maxPrice', chip.max);
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #E9D5FF',
                    backgroundColor: '#FAF5FF',
                    color: '#6D28D9',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Minimum Discount Filter */}
            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>Minimum Discount (%)</label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {[
                  { id: '', label: 'All' },
                  { id: '10', label: '10%+' },
                  { id: '25', label: '25%+' },
                  { id: '50', label: '50%+' },
                  { id: '70', label: '70%+' },
                ].map((disc) => {
                  const isSelected = localFilters.minDiscount === disc.id;
                  return (
                    <button
                      key={disc.id}
                      type="button"
                      onClick={() => handleChange('minDiscount', disc.id)}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: isSelected ? '1.5px solid #059669' : '1px solid #E5E7EB',
                        backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                        color: isSelected ? '#047857' : '#374151',
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {disc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Stock & Inventory Levels */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <Package size={15} color="#6D28D9" />
              <span>Stock & Inventory</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Stock Availability Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                {[
                  { id: '', label: 'All Stock' },
                  { id: 'in_stock', label: 'In Stock' },
                  { id: 'low_stock', label: 'Low Stock' },
                  { id: 'out_of_stock', label: 'Out of Stock' },
                ].map((st) => {
                  const isSelected = localFilters.stockStatus === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleChange('stockStatus', st.id)}
                      style={{
                        padding: '7px 6px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #6D28D9' : '1px solid #E5E7EB',
                        backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                        color: isSelected ? '#6D28D9' : '#374151',
                        fontSize: '11.5px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
              <div>
                <label style={labelStyle}>Min Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={localFilters.minStock || ''}
                  onChange={(e) => handleChange('minStock', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Max Quantity</label>
                <input
                  type="number"
                  placeholder="1000+"
                  value={localFilters.maxStock || ''}
                  onChange={(e) => handleChange('maxStock', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* 5. Brand & Tags */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <Tag size={15} color="#6D28D9" />
              <span>Brand & Tags</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div>
                <label style={labelStyle}>Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. ThePurple, Tanishq, Kalyan..."
                  value={localFilters.brand || ''}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Tag / Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. Gold 22k, Wedding, Diamond..."
                  value={localFilters.tags || ''}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* 6. Date Added Range */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>
              <Calendar size={15} color="#6D28D9" />
              <span>Date Added (Created)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
              <div>
                <label style={labelStyle}>From Date</label>
                <input
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>To Date</label>
                <input
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E8E1F5',
            backgroundColor: '#FAF8FC',
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={handleResetLocal}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>

          <button
            type="button"
            onClick={handleApply}
            style={{
              flex: 2,
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(109, 40, 217, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} strokeWidth={2.5} />
            <span>Apply Filters {activeCount > 0 ? `(${activeCount})` : ''}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Inline Style Constants ──────────────────────────────────────────
const sectionCardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E8E1F5',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
};

const sectionTitleStyle = {
  fontSize: '13.5px',
  fontWeight: 700,
  color: '#18181B',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const labelStyle = {
  display: 'block',
  fontSize: '11.5px',
  fontWeight: 600,
  color: '#4B5563',
  marginBottom: '5px',
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  fontSize: '13px',
  outline: 'none',
  backgroundColor: '#FFFFFF',
  color: '#18181B',
  boxSizing: 'border-box',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  padding: '6px 8px',
  borderRadius: '6px',
  backgroundColor: '#FAF5FF',
};

const checkboxStyle = {
  accentColor: '#7C3AED',
  width: '16px',
  height: '16px',
  cursor: 'pointer',
};
