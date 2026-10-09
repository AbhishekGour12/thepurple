"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, Check, Palette, X, ChevronDown } from 'lucide-react';
import { adminAttributeApi } from '@/lib/api/admin/attributes';

// Common color name to approximate hex mapping for smart suggestions
const COLOR_NAME_MAP = {
  stitch: '#2563EB',
  blue: '#3B82F6',
  'baby blue': '#93C5FD',
  'sky blue': '#38BDF8',
  'royal blue': '#1D4ED8',
  navy: '#1E3A8A',
  pink: '#EC4899',
  'baby pink': '#FBCFE8',
  'hot pink': '#DB2777',
  rose: '#F43F5E',
  'rose gold': '#B76E79',
  gold: '#D97706',
  'golden': '#EAB308',
  silver: '#94A3B8',
  purple: '#7E22CE',
  lavender: '#C084FC',
  violet: '#8B5CF6',
  black: '#18181B',
  white: '#FFFFFF',
  red: '#DC2626',
  ruby: '#991B1B',
  green: '#16A34A',
  emerald: '#059669',
  mint: '#6EE7B7',
  yellow: '#EAB308',
  orange: '#F97316',
  brown: '#78350F',
  beige: '#D7C4B7',
  gray: '#6B7280',
  grey: '#6B7280',
};

export default function SearchableColorSelect({
  value = '',
  onChange,
  colors = [],
  onColorCreated,
  placeholder = 'Select Color',
  allowNone = true,
  noneLabel = 'All Colors / General',
  size = 'sm',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customHex, setCustomHex] = useState('#7E22CE');
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Focus search input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [open]);

  // Auto detect hex suggestion from search text
  useEffect(() => {
    const query = search.trim().toLowerCase();
    if (!query) return;
    for (const [key, hex] of Object.entries(COLOR_NAME_MAP)) {
      if (query.includes(key)) {
        setCustomHex(hex);
        return;
      }
    }
  }, [search]);

  const selectedColor = useMemo(() => {
    return colors.find((c) => c.id === value);
  }, [colors, value]);

  const filteredColors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return colors;
    return colors.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.hexCode && c.hexCode.toLowerCase().includes(query))
    );
  }, [colors, search]);

  const exactMatchExists = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return colors.some((c) => c.name.toLowerCase() === query);
  }, [colors, search]);

  const handleCreateNewColor = async () => {
    const name = search.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const res = await adminAttributeApi.createColor(
        { name, hexCode: customHex || '#7E22CE' },
        true
      );
      const newColor = res?.color;
      if (newColor) {
        if (onColorCreated) {
          await onColorCreated(newColor);
        }
        onChange(newColor.id);
        setOpen(false);
      }
    } catch (err) {
      alert(err?.message || 'Failed to create color');
    } finally {
      setIsCreating(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', zIndex: open ? 99999 : 1 }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          padding: isSmall ? '6px 9px' : '8px 12px',
          borderRadius: '8px',
          border: selectedColor ? '1.5px solid #7E22CE' : '1px solid #CBD5E1',
          backgroundColor: selectedColor ? '#FAF5FF' : '#FFFFFF',
          fontSize: isSmall ? '11.5px' : '13px',
          fontWeight: selectedColor ? 700 : 500,
          color: selectedColor ? '#581C87' : '#475569',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
          {selectedColor ? (
            <span
              style={{
                width: isSmall ? '12px' : '14px',
                height: isSmall ? '12px' : '14px',
                borderRadius: '50%',
                backgroundColor: selectedColor.hexCode || '#E5E7EB',
                border: '1px solid #94A3B8',
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
          ) : (
            <Palette size={isSmall ? 12 : 14} color="#94A3B8" style={{ flexShrink: 0 }} />
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedColor ? selectedColor.name : placeholder}
          </span>
        </div>
        <ChevronDown size={isSmall ? 12 : 14} color="#6B7280" style={{ flexShrink: 0 }} />
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 99999,
            minWidth: '220px',
            width: 'max(100%, 220px)',
            maxWidth: '300px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.22)',
            border: '1.5px solid #E9D5FF',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* Search & Type Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              color="#94A3B8"
              style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or type color name..."
              style={{
                width: '100%',
                padding: '6px 8px 6px 28px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                color: '#1E1B4B',
                outline: 'none',
                backgroundColor: '#FAF5FF',
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Create option if no exact match */}
          {search.trim() && !exactMatchExists && (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: '#FAF5FF',
                borderRadius: '8px',
                border: '1px dashed #C084FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <label
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: customHex,
                    border: '1px solid #94A3B8',
                    cursor: 'pointer',
                    display: 'inline-block',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                  title="Choose swatch hex"
                >
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                </label>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#6B21A8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + Add &ldquo;{search.trim()}&rdquo;
                </span>
              </div>
              <button
                type="button"
                onClick={handleCreateNewColor}
                disabled={isCreating}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#7E22CE',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {isCreating ? 'Saving...' : 'Create'}
              </button>
            </div>
          )}

          {/* Color Options List */}
          <div
            style={{
              maxHeight: '160px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {allowNone && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: !value ? '#F3E8FF' : 'transparent',
                  border: 'none',
                  color: !value ? '#6B21A8' : '#475569',
                  fontSize: '12px',
                  fontWeight: !value ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3E8FF')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = !value ? '#F3E8FF' : 'transparent')}
              >
                <span>{noneLabel}</span>
                {!value && <Check size={12} color="#7E22CE" />}
              </button>
            )}

            {filteredColors.length === 0 ? (
              <div style={{ padding: '8px', textAlign: 'center', color: '#94A3B8', fontSize: '11.5px' }}>
                No colors match &ldquo;{search}&rdquo;
              </div>
            ) : (
              filteredColors.map((c) => {
                const isSelected = value === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? '#F3E8FF' : 'transparent',
                      border: 'none',
                      color: isSelected ? '#6B21A8' : '#1E1B4B',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3E8FF')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = isSelected ? '#F3E8FF' : 'transparent')
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: c.hexCode || '#CBD5E1',
                          border: '1px solid #94A3B8',
                          flexShrink: 0,
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </span>
                    </div>
                    {isSelected && <Check size={12} color="#7E22CE" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
