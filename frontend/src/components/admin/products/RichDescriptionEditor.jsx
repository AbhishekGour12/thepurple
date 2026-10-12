"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Sparkles,
  Smile,
  Eye,
  Edit3,
  Check,
  ChevronDown,
  Wand2,
  X,
  CheckCircle2,
} from 'lucide-react';
import ProductFormattedDescription from '@/components/products/ProductFormattedDescription';

const EMOJI_LIST = [
  // Sparkle & Luxury
  '✨', '💎', '👑', '⭐', '🌟', '💫', '💖', '🔥', '🪄',
  // Product & Packaging
  '🎁', '📦', '🛍️', '🧸', '💍', '👗', '👜', '🏷️', '🎀',
  // Quality & Trust
  '🛡️', '🌿', '💯', '⚡', '🚚', '🌸', '🧼', '📐', '🪡',
  // Bullets & Checks
  '•', '✔️', '✅', '🔹', '🔸', '📌', '🎯', '🚀', '👍',
];

const PRESETS = [
  {
    title: '✨ Feature Highlights',
    content: `• Premium certified high-grade materials\n• Ergonomic design for everyday comfort\n• Long-lasting shine and durable finish\n• 100% Quality inspected before dispatch`,
  },
  {
    title: '🎁 Gift & Packaging',
    content: `• Comes in signature luxury branded packaging\n• Includes authenticity certificate and care card\n• Ready for gifting on birthdays, anniversaries & celebrations`,
  },
  {
    title: '🧼 Care & Maintenance',
    content: `• Store in a dry, soft pouch away from direct moisture\n• Gently wipe with a microfiber cloth after use\n• Avoid direct contact with perfumes, chemicals & harsh sprays`,
  },
  {
    title: '🧸 Soft Toys & Plush',
    content: `• Ultra-soft velvet finish with huggable comfort\n• Hypoallergenic micro-fiber filling, 100% child-safe\n• Precision reinforced stitching with washable outer surface`,
  },
];

export default function RichDescriptionEditor({
  value = '',
  onChange,
  productName = '',
  productBrand = 'ThePurple',
  placeholder = 'Describe your product story, craftsmanship, and key highlights...',
}) {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const presetsRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (presetsRef.current && !presetsRef.current.contains(event.target)) {
        setShowPresetsMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to insert or wrap text in textarea
  const insertTextAtCursor = (beforeText, afterText = '', defaultPlaceholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const newVal = (value || '') + beforeText + defaultPlaceholder + afterText;
      onChange(newVal);
      return;
    }

    textarea.focus();
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentVal = textarea.value || '';
    const selected = currentVal.substring(start, end) || defaultPlaceholder;

    const replacement = beforeText + selected + afterText;
    const updated = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    onChange(updated);

    // Reposition cursor
    setTimeout(() => {
      if (textarea) {
        const nextPos = start + beforeText.length + selected.length + afterText.length;
        textarea.selectionStart = nextPos;
        textarea.selectionEnd = nextPos;
        textarea.focus();
      }
    }, 0);
  };

  // Insert a bullet point line
  const handleInsertBullet = (bulletPrefix = '• ') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const newVal = (value ? value + '\n' : '') + bulletPrefix;
      onChange(newVal);
      return;
    }

    textarea.focus();
    const start = textarea.selectionStart || 0;
    const currentVal = textarea.value || '';

    // Check if we are at start of a line or need a newline
    const needNewline = start > 0 && currentVal[start - 1] !== '\n';
    const insertion = (needNewline ? '\n' : '') + bulletPrefix;

    const updated = currentVal.substring(0, start) + insertion + currentVal.substring(start);
    onChange(updated);

    setTimeout(() => {
      if (textarea) {
        const nextPos = start + insertion.length;
        textarea.selectionStart = nextPos;
        textarea.selectionEnd = nextPos;
        textarea.focus();
      }
    }, 0);
  };

  // Keyboard shortcut & Enter handler for auto-bulleting
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart;
      const textBeforeCursor = (textarea.value || '').substring(0, cursor);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      // Check if current line starts with a bullet marker like '• ' or '✔ ' or '-'
      const bulletMatch = currentLine.match(/^([•\-\*✔✅▪▫]|(?:\d+\.))\s*(.*)$/);
      if (bulletMatch) {
        const marker = bulletMatch[1];
        const content = bulletMatch[2];

        // If the line is empty (only bullet marker), exit bullet mode
        if (!content.trim()) {
          e.preventDefault();
          const lineStart = cursor - currentLine.length;
          const updated = (textarea.value || '').substring(0, lineStart) + (textarea.value || '').substring(cursor);
          onChange(updated);
          setTimeout(() => {
            if (textarea) {
              textarea.selectionStart = lineStart;
              textarea.selectionEnd = lineStart;
            }
          }, 0);
          return;
        }

        // Otherwise auto-insert the bullet on next line
        e.preventDefault();
        const nextPrefix = /^\d+\.$/.test(marker)
          ? `${parseInt(marker, 10) + 1}. `
          : `${marker} `;

        const updated =
          (textarea.value || '').substring(0, cursor) +
          '\n' +
          nextPrefix +
          (textarea.value || '').substring(cursor);

        onChange(updated);
        setTimeout(() => {
          if (textarea) {
            textarea.selectionStart = cursor + 1 + nextPrefix.length;
            textarea.selectionEnd = cursor + 1 + nextPrefix.length;
          }
        }, 0);
      }
    }
  };

  // Calculate word and character count
  const charCount = (value || '').length;
  const wordCount = (value || '').trim() ? (value || '').trim().split(/\s+/).length : 0;
  const bulletCount = ((value || '').match(/^[•\-\*✔✅▪▫]|\n[•\-\*✔✅▪▫]/g) || []).length;

  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* ─── Top Header Toolbar ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Left: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {/* Bold */}
          <button
            type="button"
            onClick={() => insertTextAtCursor('**', '**', 'bold text')}
            title="Bold (**text**)"
            style={toolbarBtnStyle}
          >
            <Bold size={14} />
            <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Bold</span>
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => insertTextAtCursor('*', '*', 'italic text')}
            title="Italic (*text*)"
            style={toolbarBtnStyle}
          >
            <Italic size={14} />
            <span style={{ fontSize: '11.5px', fontStyle: 'italic' }}>Italic</span>
          </button>

          <div style={separatorStyle} />

          {/* Bullet Point */}
          <button
            type="button"
            onClick={() => handleInsertBullet('• ')}
            title="Add Bullet Point (• item)"
            style={{
              ...toolbarBtnStyle,
              backgroundColor: '#FAF5FF',
              color: '#7E22CE',
              borderColor: '#E9D5FF',
            }}
          >
            <List size={14} />
            <span style={{ fontSize: '11.5px', fontWeight: 600 }}>• Bullet</span>
          </button>

          {/* Feature Checkmark */}
          <button
            type="button"
            onClick={() => handleInsertBullet('✔ ')}
            title="Add Feature Check (✔ item)"
            style={{
              ...toolbarBtnStyle,
              backgroundColor: '#F0FDF4',
              color: '#16A34A',
              borderColor: '#BBF7D0',
            }}
          >
            <Check size={14} />
            <span style={{ fontSize: '11.5px', fontWeight: 600 }}>✔ Check</span>
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => handleInsertBullet('1. ')}
            title="Add Numbered List (1. item)"
            style={toolbarBtnStyle}
          >
            <ListOrdered size={14} />
            <span style={{ fontSize: '11.5px' }}>1. List</span>
          </button>

          <div style={separatorStyle} />

          {/* Emoji Picker Popover */}
          <div style={{ position: 'relative' }} ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Insert Emoji"
              style={{
                ...toolbarBtnStyle,
                backgroundColor: showEmojiPicker ? '#FAF5FF' : '#FFFFFF',
                color: '#7E22CE',
              }}
            >
              <Smile size={14} />
              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>Emoji</span>
              <ChevronDown size={12} />
            </button>

            {showEmojiPicker && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 50,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  padding: '10px',
                  width: '240px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    paddingBottom: '6px',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>
                    Quick Emojis
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF' }}
                  >
                    <X size={13} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '4px',
                  }}
                >
                  {EMOJI_LIST.map((emoji, eIdx) => (
                    <button
                      key={eIdx}
                      type="button"
                      onClick={() => {
                        insertTextAtCursor(emoji + ' ');
                        setShowEmojiPicker(false);
                      }}
                      style={{
                        padding: '6px',
                        fontSize: '16px',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        backgroundColor: '#F9FAFB',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FAF5FF';
                        e.currentTarget.style.borderColor = '#D8B4FE';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets / Templates */}
          <div style={{ position: 'relative' }} ref={presetsRef}>
            <button
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              title="Insert Bullet Template"
              style={{
                ...toolbarBtnStyle,
                color: '#4B5563',
              }}
            >
              <Wand2 size={13} style={{ color: '#9333EA' }} />
              <span style={{ fontSize: '11.5px' }}>Templates</span>
              <ChevronDown size={12} />
            </button>

            {showPresetsMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 50,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  padding: '6px',
                  width: '260px',
                }}
              >
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    padding: '6px 8px 4px',
                  }}
                >
                  Insert Bullet Presets
                </div>
                {PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      const prefix = value && !value.endsWith('\n\n') ? (value.endsWith('\n') ? '\n' : '\n\n') : '';
                      onChange((value || '') + prefix + preset.content);
                      setShowPresetsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E1B4B' }}>{preset.title}</span>
                    <span style={{ fontSize: '10.5px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preset.content.split('\n')[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Write vs Preview Mode Toggle */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#E5E7EB',
            borderRadius: '8px',
            padding: '2px',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'edit' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'edit' ? '#7E22CE' : '#4B5563',
              boxShadow: activeTab === 'edit' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <Edit3 size={13} />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'preview' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'preview' ? '#7E22CE' : '#4B5563',
              boxShadow: activeTab === 'preview' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <Eye size={13} />
            <span>Storefront Preview</span>
          </button>
        </div>
      </div>

      {/* ─── Editor Body ─── */}
      {activeTab === 'edit' ? (
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%',
              minHeight: '140px',
              padding: '12px 14px',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#1F2937',
              backgroundColor: '#FFFFFF',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            padding: '16px 18px',
            backgroundColor: '#FAF5FF',
            minHeight: '140px',
            borderBottom: '1px solid #F3E8FF',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#7E22CE',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={13} />
            <span>Customer Product Page Preview</span>
          </div>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #E9D5FF',
            }}
          >
            <ProductFormattedDescription
              description={value}
              fallbackName={productName}
              fallbackBrand={productBrand}
            />
          </div>
        </div>
      )}

      {/* ─── Bottom Footer Bar: Guidance & Stats ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          backgroundColor: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          fontSize: '11.5px',
          color: '#6B7280',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#7E22CE', fontWeight: 600 }}>💡 Tip:</span>
          <span>Start a line with <code style={codeStyle}>• </code> or <code style={codeStyle}>✔ </code> for checkmark highlights. Use <code style={codeStyle}>**bold**</code> for emphasis.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
          {bulletCount > 0 && (
            <span style={{ color: '#7E22CE', fontWeight: 600 }}>
              {bulletCount} {bulletCount === 1 ? 'bullet' : 'bullets'}
            </span>
          )}
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>
    </div>
  );
}

const toolbarBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '5px 8px',
  borderRadius: '6px',
  border: '1px solid #E5E7EB',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
  color: '#374151',
  transition: 'all 0.15s ease',
};

const separatorStyle = {
  width: '1px',
  height: '18px',
  backgroundColor: '#E5E7EB',
  margin: '0 3px',
};

const codeStyle = {
  backgroundColor: '#F3E8FF',
  color: '#6B21A8',
  padding: '1px 5px',
  borderRadius: '4px',
  fontSize: '10.5px',
  fontWeight: 600,
};
