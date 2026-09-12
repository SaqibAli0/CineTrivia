/**
 * Single source of truth for site-level constants (URL, social profiles).
 *
 * Everything (sitemap, robots, layout, JSON-LD, OG images) imports SITE_URL
 * from here so a missing env var can never split canonicals across a wrong
 * fallback domain.
 */

/**
 * The canonical site URL. Prefer the env var; the hardcoded fallback is the
 * REAL configured production domain (cinetrivia.netlify.app) — not a random
 * per-deploy Netlify subdomain — so canonicals stay consistent if the env is
 * ever missing.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://cinetrivia.netlify.app';

/**
 * Public social/profile URLs for Organization.sameAs (E-E-A-T signals).
 * Env-driven so they can be set per-deploy without code changes; empty values
 * are filtered out.
 */
export const SOCIAL_PROFILES: string[] = [
  process.env.NEXT_PUBLIC_TWITTER_URL,
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_FACEBOOK_URL,
  process.env.NEXT_PUBLIC_GITHUB_URL,
].filter((u): u is string => Boolean(u && u.trim()));
