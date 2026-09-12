/**
 * Affiliate link mapping for streaming providers.
 *
 * Each provider is matched by name and routed to the right search/browse URL,
 * with affiliate tracking params attached when the matching env var is set.
 * Unconfigured providers still return a working (untracked) search link, so
 * the "Watch" buttons never break.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Affiliate env keys (all optional — add the ones whose programs you join):
 *
 *   NEXT_PUBLIC_AMAZON_AFFILIATE_ID     Amazon Associates tag  (…?tag=yourtag-20)
 *                                       → affiliate-program.amazon.com
 *   NEXT_PUBLIC_APPLE_AFFILIATE_TOKEN   Apple Services token   (…&at=token)
 *                                       → performance-partners.apple.com
 *   NEXT_PUBLIC_IMPACT_SUBID            Impact/partner sub-id appended as
 *                                       ?subId1=… on supported partner links
 *                                       (Paramount+, Peacock, Max, etc. run
 *                                       their programs through Impact/CJ)
 *   NEXT_PUBLIC_FANDANGO_AFFILIATE_ID   Fandango/Vudu (Fandango at Home) partner
 *                                       id → used as the generic rent/buy option
 *
 * Providers without a public affiliate program (Netflix, Disney+, Hulu,
 * Shudder) fall back to a plain search link. Update the configs below as you
 * join more programs.
 * ─────────────────────────────────────────────────────────────────────────
 */

interface AffiliateConfig {
  /** Pattern to match provider name (case-insensitive) */
  pattern: RegExp;
  /** Whether this provider has affiliate tracking configured. */
  hasTracking: () => boolean;
  /** Generate the URL for this provider (tracked when configured). */
  getUrl: (movieTitle: string, year: number) => string;
}

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || '';
const APPLE_TOKEN = process.env.NEXT_PUBLIC_APPLE_AFFILIATE_TOKEN || '';
const IMPACT_SUBID = process.env.NEXT_PUBLIC_IMPACT_SUBID || '';
const FANDANGO_ID = process.env.NEXT_PUBLIC_FANDANGO_AFFILIATE_ID || '';

/** Append an Impact/partner sub-id to a URL when configured. */
function withImpact(url: string): string {
  if (!IMPACT_SUBID) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}subId1=${encodeURIComponent(IMPACT_SUBID)}`;
}

const AFFILIATE_CONFIGS: AffiliateConfig[] = [
  {
    pattern: /amazon|prime video/i,
    hasTracking: () => Boolean(AMAZON_TAG),
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title} ${year}`);
      const tag = AMAZON_TAG ? `&tag=${AMAZON_TAG}` : '';
      return `https://www.amazon.com/s?k=${q}&i=instant-video${tag}`;
    },
  },
  {
    pattern: /apple tv/i,
    hasTracking: () => Boolean(APPLE_TOKEN),
    getUrl: (title) => {
      const q = encodeURIComponent(title);
      const token = APPLE_TOKEN ? `&at=${APPLE_TOKEN}` : '';
      return `https://tv.apple.com/search?term=${q}${token}`;
    },
  },
  {
    // Fandango at Home (formerly Vudu) — common rent/buy affiliate option.
    pattern: /vudu|fandango/i,
    hasTracking: () => Boolean(FANDANGO_ID || IMPACT_SUBID),
    getUrl: (title) => {
      const q = encodeURIComponent(title);
      const base = `https://www.fandangoathome.com/search?q=${q}`;
      const withId = FANDANGO_ID ? `${base}&cmp=${encodeURIComponent(FANDANGO_ID)}` : base;
      return withImpact(withId);
    },
  },
  {
    pattern: /paramount/i,
    hasTracking: () => Boolean(IMPACT_SUBID),
    getUrl: (title) => withImpact(`https://www.paramountplus.com/search/?q=${encodeURIComponent(title)}`),
  },
  {
    pattern: /peacock/i,
    hasTracking: () => Boolean(IMPACT_SUBID),
    getUrl: (title) => withImpact(`https://www.peacocktv.com/search?q=${encodeURIComponent(title)}`),
  },
  {
    pattern: /hbo|max/i,
    hasTracking: () => Boolean(IMPACT_SUBID),
    getUrl: (title) => withImpact(`https://www.max.com/search?q=${encodeURIComponent(title)}`),
  },
  // ── Providers without a public affiliate program: plain search links ──
  {
    pattern: /netflix/i,
    hasTracking: () => false,
    getUrl: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    pattern: /disney/i,
    hasTracking: () => false,
    getUrl: (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    pattern: /hulu/i,
    hasTracking: () => false,
    getUrl: (title) => `https://www.hulu.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    pattern: /shudder/i,
    hasTracking: () => false,
    getUrl: (title) => `https://www.shudder.com/search?q=${encodeURIComponent(title)}`,
  },
];

/**
 * Get the affiliate (or plain search) URL for a provider.
 * Falls back to a Google search when the provider isn't recognized.
 */
export function getAffiliateUrl(
  providerName: string,
  movieTitle: string,
  year: number
): string {
  for (const config of AFFILIATE_CONFIGS) {
    if (config.pattern.test(providerName)) {
      return config.getUrl(movieTitle, year);
    }
  }

  // Fallback: Google search
  const q = encodeURIComponent(`watch ${movieTitle} ${year} on ${providerName}`);
  return `https://www.google.com/search?q=${q}`;
}

/**
 * Whether a given provider currently returns a tracked (affiliate) link.
 * Useful for tests and for conditionally surfacing "supported" badges.
 */
export function hasAffiliateTracking(providerName: string): boolean {
  const config = AFFILIATE_CONFIGS.find((c) => c.pattern.test(providerName));
  return config ? config.hasTracking() : false;
}

/**
 * Track an affiliate link click via GA4 custom event.
 * Call this in onClick handlers for affiliate links.
 * Only fires if GA4 is loaded (gtag exists on window).
 */
export function trackAffiliateClick(providerName: string, movieTitle: string, year: number): void {
  if (typeof window !== 'undefined') {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'affiliate_click', {
        provider: providerName,
        movie_title: movieTitle,
        movie_year: year,
      });
    }
  }
}
