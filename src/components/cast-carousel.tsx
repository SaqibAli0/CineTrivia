'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CastMember } from '@/lib/tmdb-details';

interface CastCarouselProps {
  cast: CastMember[];
}

export function CastCarousel({ cast }: CastCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) { setCanScrollLeft(false); setCanScrollRight(false); return; }
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => { el.removeEventListener('scroll', updateScroll); window.removeEventListener('resize', updateScroll); };
  }, [updateScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -el.clientWidth * 0.7 : el.clientWidth * 0.7, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 border border-bordercolor bg-charcoal/90 flex items-center justify-center text-parchment hover:border-terracotta hover:text-terracotta transition-colors -ml-1" aria-label="Scroll left">
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 border border-bordercolor bg-charcoal/90 flex items-center justify-center text-parchment hover:border-terracotta hover:text-terracotta transition-colors -mr-1" aria-label="Scroll right">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {cast.map((actor, i) => (
          <div key={actor.name} className="shrink-0 w-[130px] sm:w-[140px] spec-card group">
            <div className="px-2 py-1.5 border-b border-bordercolor mono-font text-[8px] text-parchment/40">
              CAST_{String(i + 1).padStart(2, '0')}
            </div>
            <div className="w-full aspect-[3/4] bg-black/30 relative overflow-hidden">
              {actor.profileUrl ? (
                <Image src={actor.profileUrl} alt={actor.name} fill sizes="140px" className="object-cover image-filter" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-parchment/20" />
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="mono-font text-[9px] text-parchment font-semibold truncate">{actor.name}</p>
              <p className="mono-font text-[8px] text-parchment/50 truncate mt-0.5">as {actor.character}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
