'use client';

import Image from 'next/image';
import { CirclePlay } from 'lucide-react';
import type { WatchProvider } from '@/lib/tmdb-details';

interface WatchButtonsProps {
  movieTitle: string;
  year: number;
  providers: WatchProvider[];
}

/**
 * Shows actual streaming platforms where the movie is available.
 * Data comes from TMDB's watch providers API.
 * Falls back to search links if no providers found.
 */
export function WatchButtons({ movieTitle, year, providers }: WatchButtonsProps) {
  const q = encodeURIComponent(`${movieTitle} ${year}`);

  // If TMDB returned real providers, show those
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
              href={`https://www.google.com/search?q=watch+${q}+on+${encodeURIComponent(provider.name)}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
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
        <p className="text-[10px] text-muted-foreground/50 mt-3">
          Availability may vary by region. Links may contain affiliate tags.
        </p>
      </div>
    );
  }

  // Fallback: no provider data available — movie likely just released or not on OTT yet
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
