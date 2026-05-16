/**
 * Slug utilities for SEO-friendly movie URLs.
 *
 * Format: movie-name-year (e.g. "inception-2010", "the-dark-knight-2008")
 */

/**
 * Generate a URL slug from a movie title and year.
 */
export function toSlug(title: string, year: number): string {
  const base = title
    .toLowerCase()
    .replace(/['']/g, '')           // Remove apostrophes
    .replace(/&/g, 'and')           // Replace & with "and"
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special chars
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '');         // Trim leading/trailing hyphens

  return `${base}-${year}`;
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
