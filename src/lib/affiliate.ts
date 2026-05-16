/**
 * Affiliate link mapping for streaming providers.
 *
 * Each provider gets matched by name and routed to the right
 * search/browse URL with affiliate tracking params attached.
 *
 * To activate: add your affiliate IDs to .env
 * - NEXT_PUBLIC_AMAZON_AFFILIATE_ID (from affiliate-program.amazon.com)
 * - NEXT_PUBLIC_APPLE_AFFILIATE_TOKEN (from performance-partners.apple.com)
 */

// Affiliate IDs from .env (empty = no tracking, links still work)
// NEXT_PUBLIC_AMAZON_AFFILIATE_ID=your-tag-20
// NEXT_PUBLIC_APPLE_AFFILIATE_TOKEN=your-token

interface AffiliateConfig {
  /** Pattern to match provider name (case-insensitive) */
  pattern: RegExp;
  /** Generate the affiliate URL for this provider */
  getUrl: (movieTitle: string, year: number) => string;
}

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || '';
const APPLE_TOKEN = process.env.NEXT_PUBLIC_APPLE_AFFILIATE_TOKEN || '';

const AFFILIATE_CONFIGS: AffiliateConfig[] = [
  {
    pattern: /amazon|prime video/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title} ${year}`);
      const tag = AMAZON_TAG ? `&tag=${AMAZON_TAG}` : '';
      return `https://www.amazon.com/s?k=${q}&i=instant-video${tag}`;
    },
  },
  {
    pattern: /apple tv/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title}`);
      const token = APPLE_TOKEN ? `&at=${APPLE_TOKEN}` : '';
      return `https://tv.apple.com/search?term=${q}${token}`;
    },
  },
  {
    pattern: /paramount/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title}`);
      return `https://www.paramountplus.com/search/?q=${q}`;
    },
  },
  {
    pattern: /netflix/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title}`);
      return `https://www.netflix.com/search?q=${q}`;
    },
  },
  {
    pattern: /disney/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title}`);
      return `https://www.disneyplus.com/search?q=${q}`;
    },
  },
  {
    pattern: /hulu/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title}`);
      return `https://www.hulu.com/search?q=${q}`;
    },
  },
  {
    pattern: /hbo|max/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title}`);
      return `https://www.max.com/search?q=${q}`;
    },
  },
  {
    pattern: /shudder/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title}`);
      return `https://www.shudder.com/search?q=${q}`;
    },
  },
  {
    pattern: /peacock/i,
    getUrl: (title, year) => {
      const q = encodeURIComponent(`${title}`);
      return `https://www.peacocktv.com/search?q=${q}`;
    },
  },
];

/**
 * Get the affiliate URL for a provider, or fall back to Google search.
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
