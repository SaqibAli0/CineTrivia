'use client';

import { MediaCard } from './media-card';
import type { MediaItem } from '@/lib/media';

interface MediaSearchResultsProps {
  query: string;
  items: MediaItem[];
  unavailable?: boolean;
}

/**
 * Cross-source (movies + TV + animation) search results grid. Each card links
 * to /movie, /tv, or /animation via the item's `mediaHref`.
 */
export function MediaSearchResults({ query, items, unavailable = false }: MediaSearchResultsProps) {
  if (unavailable && items.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-lg font-medium text-foreground">Search is temporarily unavailable</p>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          We couldn&apos;t reach the movie/TV databases right now. Try again shortly, or switch
          your DNS/VPN if it persists.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-lg font-medium text-foreground">
          No results found for &ldquo;{query}&rdquo;
        </p>
        <p className="text-muted-foreground text-sm">Try a different title or check the spelling.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
      {items.map((item, i) => (
        <div
          key={`${item.source}-${item.id}`}
          className="animate-item-in"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        >
          <MediaCard item={item} />
        </div>
      ))}
    </div>
  );
}
