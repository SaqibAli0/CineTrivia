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
    if (maxScroll <= 0) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      el.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [updateScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-card transition-colors -ml-2 sm:-ml-3"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-card transition-colors -mr-2 sm:-mr-3"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Cast cards row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cast.map((actor) => (
          <div
            key={actor.name}
            className="shrink-0 w-[130px] sm:w-[145px] snap-start rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <div className="w-full aspect-[3/4] bg-muted relative overflow-hidden">
              {actor.profileUrl ? (
                <Image
                  src={actor.profileUrl}
                  alt={actor.name}
                  fill
                  sizes="145px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold text-foreground line-clamp-1">{actor.name}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                as {actor.character}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
