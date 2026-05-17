'use client';

import Image from 'next/image';
import type { WatchProvider } from '@/lib/tmdb-details';
import { getAffiliateUrl } from '@/lib/affiliate';

interface WatchButtonsProps {
  movieTitle: string;
  year: number;
  providers: WatchProvider[];
}

export function WatchButtons({ movieTitle, year, providers }: WatchButtonsProps) {
  if (providers.length > 0) {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {providers.map((provider) => (
            <a
              key={provider.id}
              href={getAffiliateUrl(provider.name, movieTitle, year)}
              target="_blank"
              rel="noopener sponsored"
              className="spec-card !flex-row p-4 items-center gap-4 group cursor-pointer"
            >
              {provider.logoUrl && (
                <Image src={provider.logoUrl} alt={provider.name} width={32} height={32} className="shrink-0 rounded" />
              )}
              <span className="mono-font text-parchment/70 group-hover:text-parchment transition-colors">
                {provider.name}
              </span>
            </a>
          ))}
        </div>
        <p className="mono-font text-[9px] text-parchment/30 mt-4">
          Availability varies by region. Some links are affiliate links.
        </p>
      </div>
    );
  }

  return (
    <div className="spec-card p-6 text-center">
      <p className="mono-font text-parchment/60">
        No streaming data available. This movie may be in theatrical release or awaiting digital distribution.
      </p>
    </div>
  );
}
