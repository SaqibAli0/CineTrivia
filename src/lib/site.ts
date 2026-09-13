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
 * Stable "last content update" date for structural pages (home, about, genre
 * indexes, /tv, /animation, and templated detail pages).
 *
 * Why not `new Date()`? The sitemap regenerates daily, so `new Date()` stamps
 * EVERY url with today's date on every crawl — which tells search engines the
 * whole site changes daily. That's a low-trust "churn" signal and gets the
 * freshness data ignored. A stable date that only moves when the site is
 * meaningfully updated is far more credible.
 *
 * Bump this (or set NEXT_PUBLIC_CONTENT_UPDATED) whenever the site's structure
 * or templates change in a way worth re-crawling.
 */
export const CONTENT_UPDATED_DATE = new Date(
  process.env.NEXT_PUBLIC_CONTENT_UPDATED || '2026-09-13'
);

/**
 * IndexNow key (from env only — never hardcoded in source). Enables instant
 * crawl pings to Bing/Yandex/Seznam when content changes. Google does NOT use
 * IndexNow. Empty string disables the feature (the verification route 404s and
 * pings are skipped). The key is served at `/<key>.txt` by a dynamic route so
 * changing INDEXNOW_KEY needs no code change.
 */
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';

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
