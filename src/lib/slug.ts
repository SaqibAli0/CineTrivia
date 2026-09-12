/**
 * Slug utilities for SEO-friendly movie URLs.
 *
 * Format: movie-name-year (e.g. "inception-2010", "the-dark-knight-2008")
 *
 * This is the SINGLE canonical source of slug logic. Any place that needs to
 * build a movie slug (tmdb-details, sitemap, blog related movies, etc.) must
 * import `toSlug` from here rather than re-implementing the transform, so the
 * output stays consistent everywhere.
 */

/**
 * Normalize a title into the slug "base" (without the trailing year).
 *
 * Diacritics are transliterated to ASCII *before* the special-char strip so
 * accented titles keep their letters. For example "Léon" normalizes to "leon"
 * instead of the old buggy "lon" (where the raw `[^a-z0-9]` strip deleted "é").
 *
 * Known limitation: non-Latin scripts (Japanese, Cyrillic, etc.) have no ASCII
 * equivalent under NFKD, so they still get stripped. `fromSlug` + the
 * title-only TMDB fallback in `findMovieId` handle those cases.
 */
export function slugifyTitle(title: string): string {
  return title
    .normalize('NFKD')              // "léon" → "le" + combining accent
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks → "leon"
    .toLowerCase()
    .replace(/['']/g, '')           // Remove apostrophes (no separator): "don't" → "dont"
    .replace(/&/g, 'and')           // Replace & with "and"
    // Separator-style punctuation becomes a word break so it turns into a
    // hyphen, not a deletion: "WALL·E" → "wall-e", "Mission: Impossible" →
    // "mission-impossible". Covers middle dot, bullet, slashes, colon, dashes.
    .replace(/[·•\/:_\u2013\u2014]+/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')   // Remove remaining special chars
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '');         // Trim leading/trailing hyphens
}

/**
 * Generate a URL slug from a movie title and year.
 */
export function toSlug(title: string, year: number): string {
  return `${slugifyTitle(title)}-${year}`;
}

/**
 * Extract the movie title (approximate) and year from a slug.
 * Returns null if the slug doesn't match expected format.
 */
export function fromSlug(slug: string): { title: string; year: number } | null {
  // Year is always the last segment after the final hyphen
  const match = slug.match(/^(.+)-(\d{4})$/);
  if (!match) return null;

  const title = match[1]
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title case
  const year = parseInt(match[2], 10);

  if (year < 1888 || year > 2100) return null; // Sanity check

  return { title, year };
}
