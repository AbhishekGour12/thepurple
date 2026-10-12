"use client";

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Parses raw text into paragraphs and bullet items.
 * Supports bullet markers: •, -, *, ✔, ✅, ▪, ▫, numbered (1., 2.), and emoji markers (✨, 💎, ⭐, 🎁).
 */
export function parseDescription(rawText) {
  if (!rawText || !rawText.trim()) {
    return { paragraphs: [], bullets: [] };
  }

  const lines = rawText.split('\n');
  const paragraphs = [];
  const bullets = [];
  let currentPara = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
      continue;
    }

    // Match bullet marker at line start
    // Matches: •, -, *, ✔, ✅, ▪, ▫, numbers like 1., 2., or emojis like ✨, 💎, ⭐, 🎁, 👑, 📦, 🌿, 🏷️
    const bulletMatch = trimmed.match(
      /^([•\-\*✔✅▪▫]|\d+[\.\)]|✨|💎|⭐|🎁|👑|📦|🌿|🏷️|💯|⚡|🛡️)\s*(.+)$/u
    );

    if (bulletMatch) {
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
      const marker = bulletMatch[1];
      const text = bulletMatch[2];
      bullets.push({ marker, text });
    } else {
      currentPara.push(trimmed);
    }
  }

  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join(' '));
  }

  return { paragraphs, bullets };
}

/**
 * Safely renders inline markdown:
 * **bold** -> strong
 * *italic* or _italic_ -> em
 * `code` -> code
 */
export function renderInlineFormatted(text) {
  if (!text) return null;

  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push({ type: 'bold', content: token.slice(2, -2) });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push({ type: 'italic', content: token.slice(1, -1) });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push({ type: 'code', content: token.slice(1, -1) });
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return parts.map((part, idx) => {
    if (part.type === 'bold') {
      return (
        <strong key={idx} style={{ fontWeight: 700, color: '#1E1B4B' }}>
          {part.content}
        </strong>
      );
    }
    if (part.type === 'italic') {
      return (
        <span key={idx} style={{ fontStyle: 'italic', color: '#6B7280', fontWeight: 400 }}>
          {part.content}
        </span>
      );
    }
    if (part.type === 'code') {
      return (
        <code
          key={idx}
          style={{
            background: '#F3E8FF',
            color: '#6B21A8',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.9em',
          }}
        >
          {part.content}
        </code>
      );
    }
    return <span key={idx}>{part.content}</span>;
  });
}

/**
 * Component that displays product description with clean paragraphs and bullet points.
 * Eliminates hardcoded jewelry lines so every brand/product shows only its own custom content.
 */
export default function ProductFormattedDescription({
  description,
  fallbackName = '',
  fallbackBrand = 'ThePurple',
  className = '',
}) {
  const { paragraphs, bullets } = parseDescription(description);

  if (!description && !paragraphs.length && !bullets.length) {
    return (
      <div style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.6', fontStyle: 'italic' }}>
        {fallbackName
          ? `${fallbackName} — Crafted with supreme care and attention to detail by ${fallbackBrand}.`
          : 'High-quality authentic product crafted for comfort, style and everyday elegance.'}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Paragraphs */}
      {paragraphs.map((para, pIdx) => (
        <p
          key={pIdx}
          style={{
            fontSize: '13px',
            color: '#4B5563',
            lineHeight: '1.65',
            margin: 0,
          }}
        >
          {renderInlineFormatted(para)}
        </p>
      ))}

      {/* Bullets List */}
      {bullets.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
            marginTop: paragraphs.length ? '4px' : '0',
          }}
        >
          {bullets.map((b, bIdx) => {
            // Check if marker is an emoji or checkmark
            const isEmojiOrCustom = ['✨', '💎', '⭐', '🎁', '👑', '📦', '🌿', '🏷️', '💯', '⚡', '🛡️'].includes(
              b.marker
            );

            return (
              <div
                key={bIdx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '12.5px',
                  color: '#374151',
                  lineHeight: '1.5',
                }}
              >
                {isEmojiOrCustom ? (
                  <span style={{ fontSize: '14px', flexShrink: 0, lineHeight: 1.2 }}>{b.marker}</span>
                ) : (
                  <CheckCircle2
                    size={16}
                    color="#7E22CE"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  />
                )}
                <span style={{ flex: 1 }}>{renderInlineFormatted(b.text)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
