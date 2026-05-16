'use client';

import Image from 'next/image';
import { CirclePlay } from 'lucide-react';
import type { WatchProvider } from '@/lib/tmdb-details';
import { getAffiliateUrl } from '@/lib/affiliate';

interface WatchButtonsProps {
  movieTitle: string;
  year: number;
  providers: WatchProvider[];
}

/**
 * Shows actual streaming platforms where the movie is available.
 * Data comes from TMDB's watch providers API.
 * Links use affiliate URLs when configured.
 */
export function WatchButtons({ movieTitle, year, providers }: WatchButtonsProps) {
  // If TMDB returned real providers, show those with affiliate links
  if (providers.length > 0) {
    return (
      <div>
        <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-5 flex items-center gap-2">
          <CirclePlay className="w-5 h-5 text-primary" />
          Where to Watch
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {providers.map((provider) => (
            <a
              key={provider.id}
              href={getAffiliateUrl(provider.name, movieTitle, year)}
              target="_blank"
              rel="noopener sponsored"
              className="group flex items-center gap-3 h-12 px-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-all duration-200"
            >
              {provider.logoUrl && (
                <Image
                  src={provider.logoUrl}
                  alt={provider.name}
                  width={28}
                  height={28}
                  className="rounded-md shrink-0"
                />
              )}
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                {provider.name}
              </span>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-3">
          Availability may vary by region. Some links are affiliate links — we may earn a commission at no extra cost to you.
        </p>
      </div>
    );
  }

  // Fallback: no provider data available
  return (
    <div>
      <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-5 flex items-center gap-2">
        <CirclePlay className="w-5 h-5 text-primary" />
        Where to Watch
      </h2>
      <div className="p-5 rounded-xl bg-card border border-border text-center">
        <p className="text-sm text-muted-foreground">
          This movie is not yet available on streaming platforms. It may still be in theaters or awaiting a digital release.
        </p>
      </div>
    </div>
  );
}
