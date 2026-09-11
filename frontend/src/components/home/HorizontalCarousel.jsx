'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HorizontalCarousel({ children, scrollAmount, gap = 16 }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 6);
    setCanRight(max > 6 && el.scrollLeft < max - 6);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    const timer = setTimeout(updateArrows, 100);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
      clearTimeout(timer);
    };
  }, [updateArrows, children]);

  const scrollByDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const scrollDist = scrollAmount || Math.max(el.clientWidth * 0.8, 260);
    el.scrollBy({ left: dir * scrollDist, behavior: 'smooth' });
  };

  const showNav = canLeft || canRight;

  return (
    <div className="h-carousel" style={{ position: 'relative', width: '100%' }}>
      {showNav && (
        <button
          type="button"
          aria-label="Scroll left"
          disabled={!canLeft}
          onClick={() => scrollByDir(-1)}
          className="h-carousel-btn h-carousel-btn-left"
          style={{
            opacity: canLeft ? 1 : 0,
            pointerEvents: canLeft ? 'auto' : 'none',
            visibility: canLeft ? 'visible' : 'hidden',
          }}
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>
      )}

      <div ref={trackRef} className="h-carousel-track" style={{ gap: `${gap}px` }}>
        {children}
      </div>

      {showNav && (
        <button
          type="button"
          aria-label="Scroll right"
          disabled={!canRight}
          onClick={() => scrollByDir(1)}
          className="h-carousel-btn h-carousel-btn-right"
          style={{
            opacity: canRight ? 1 : 0,
            pointerEvents: canRight ? 'auto' : 'none',
            visibility: canRight ? 'visible' : 'hidden',
          }}
        >
          <ChevronRight size={20} strokeWidth={2.4} />
        </button>
      )}

      <style jsx>{`
        .h-carousel-track {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-behavior: smooth;
          scroll-snap-type: x proximity;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 6px 2px 14px;
          width: 100%;
        }
        .h-carousel-track::-webkit-scrollbar {
          display: none;
        }
        .h-carousel-track > :global(*) {
          scroll-snap-align: start;
        }
        .h-carousel-btn {
          position: absolute;
          top: 48%;
          transform: translateY(-50%);
          z-index: 5;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1.5px solid #E8E1F5;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(8px);
          color: #18181B;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(109, 40, 217, 0.16);
          transition: all 0.2s ease;
        }
        .h-carousel-btn:hover {
          background: #7C3AED;
          color: #FFFFFF;
          border-color: #7C3AED;
          box-shadow: 0 8px 24px rgba(109, 40, 217, 0.28);
          transform: translateY(-50%) scale(1.08);
        }
        .h-carousel-btn-left {
          left: -14px;
        }
        .h-carousel-btn-right {
          right: -14px;
        }
        @media (max-width: 768px) {
          .h-carousel-btn {
            width: 32px;
            height: 32px;
          }
          .h-carousel-btn-left {
            left: -6px;
          }
          .h-carousel-btn-right {
            right: -6px;
          }
        }
      `}</style>
    </div>
  );
}
