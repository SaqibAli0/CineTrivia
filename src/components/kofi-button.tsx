'use client';

import { Coffee } from 'lucide-react';
import { getKofiUrl, trackKofiClick } from '@/lib/kofi';

interface KofiButtonProps {
  /** Visual variant. "inline" is a compact button; "card" adds the support copy. */
  variant?: 'inline' | 'card';
  className?: string;
}

/**
 * "Buy Me a Coffee" support widget (Ko-fi).
 *
 * Lightweight — a plain link, no heavy third-party script. Renders nothing when
 * NEXT_PUBLIC_KOFI_URL is unset (same env-gating pattern as AdSense/GA4). Fires
 * a GA4 `kofi_click` event when gtag is present.
 */
export function KofiButton({ variant = 'inline', className = '' }: KofiButtonProps) {
  const kofiUrl = getKofiUrl();
  if (!kofiUrl) return null;

  function handleClick() {
    trackKofiClick(variant);
  }

  const button = (
    <a
      href={kofiUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Support CineTrivia on Ko-fi"
      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <Coffee className="h-4 w-4" />
      Buy me a coffee
    </a>
  );

  if (variant === 'card') {
    return (
      <div
        className={`flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 sm:flex-row sm:items-center sm:justify-between ${className}`}
      >
        <p className="text-sm text-muted-foreground">
          CineTrivia is indie and ad-free. Support the server cost by buying the dev a coffee!
        </p>
        {button}
      </div>
    );
  }

  return <div className={className}>{button}</div>;
}
