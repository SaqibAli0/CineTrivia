/**
 * Content safety filter for movie results.
 *
 * Goal: keep the app family-of-cinema friendly by removing *pornographic*
 * titles (hardcore adult films and porn parodies) that slip past TMDB's
 * `include_adult=false` flag, WITHOUT removing legitimate R-rated movies.
 *
 * Design principles:
 * - Prefer TMDB's own `adult` flag first (authoritative when set).
 * - Use tight, high-precision title/overview patterns for the rest. A single
 *   common word like "sex" or "nude" is NOT enough to drop a film, because
 *   those appear in mainstream titles (e.g. "Sex, Lies, and Videotape",
 *   "Sex Education"). We only match explicit-porn signals or strong combos.
 * - When unsure, KEEP the movie. Over-filtering hurts more than the rare miss.
 */

interface FilterableMovie {
  title: string;
  overview?: string;
  adult?: boolean;
}

/**
 * High-precision markers of pornographic content. These are strong enough on
 * their own that a mainstream film is very unlikely to match.
 */
const HARDCORE_PATTERNS: RegExp[] = [
  /\bx{3}\b/i, // "XXX" as a standalone word (rating marker)
  /\bhardcore\s+(porn|sex|xxx)\b/i,
  /\bporn(o|ographic|ography)?\b/i, // porn / porno / pornographic
  /\bhentai\b/i,
  /\bpornstar\b/i,
  /\bmilf\b/i,
  /\bgangbang\b/i,
  /\bbukkake\b/i,
  /\bcreampie\b/i,
  /\bcumshot\b/i,
  /\bdeep\s?throat\b/i,
  /\bfootjob\b|\bhandjob\b|\bblowjob\b/i,
  /\banal\s+(sex|scene|creampie)\b/i,
  /\b(a\s+)?(xxx|porn|adult)\s+parody\b/i, // "A XXX Parody" / "porn parody"
  /\bparody\s+(xxx|porn)\b/i,
];

/**
 * Softcore / erotica / adult-parody markers. These catch titles like
 * "Bikini Avengers" that aren't hardcore or TMDB-flagged but are clearly
 * sexploitation parodies unsuitable for a general-audience movie site.
 *
 * Tradeoff: a rare legitimate title containing one of these words (e.g. an old
 * "Bikini Beach" comedy) may also be dropped. Given the reputational/legal risk
 * of surfacing softcore parodies, we intentionally err toward removing them.
 */
const SOFTCORE_PATTERNS: RegExp[] = [
  /\bbikini\b/i, // "Bikini Avengers" and similar sexploitation parodies
  /\berotica?\b/i, // erotic / erotica
  /\bsoftcore\b/i,
  /\bsexploitation\b/i,
  /\bplayboy\b/i,
  /\bpenthouse\s+pet/i,
  /\bnympho\w*\b/i,
  /\bnude\s+(girls?|models?|women|coeds?)\b/i,
  /\bsex\s+(romp|kitten)\b/i,
];

/**
 * Porn-parody title shapes, e.g. "<Something>: A XXX Parody", "... Porn Parody",
 * or a "(XXX ...)" / "(Adult ...)" suffix. Requires an explicit xxx/porn/adult
 * marker — plain comedy parodies ("Scary Movie", "A Haunted House") are NOT
 * matched. Case-insensitive.
 */
const PARODY_SUFFIX = /(:\s*(a\s+)?(xxx|porn|adult)\b[^:]*\bparody\b|\b(xxx|porn|adult)\s+parody\b|\(\s*(xxx|porn|adult)\b)/i;

/**
 * Returns true when a movie should be REMOVED (pornographic / porn parody).
 */
export function isPornographic(movie: FilterableMovie): boolean {
  // 1) Trust TMDB's own adult flag.
  if (movie.adult === true) return true;

  const haystacks = [movie.title ?? '', movie.overview ?? ''];

  for (const text of haystacks) {
    if (!text) continue;
    if (PARODY_SUFFIX.test(text)) return true;
    for (const pattern of HARDCORE_PATTERNS) {
      if (pattern.test(text)) return true;
    }
    for (const pattern of SOFTCORE_PATTERNS) {
      if (pattern.test(text)) return true;
    }
  }

  return false;
}

/**
 * Filter a list of movies, removing pornographic titles while keeping
 * legitimate R-rated films.
 */
export function filterExplicit<T extends FilterableMovie>(movies: T[]): T[] {
  return movies.filter((m) => !isPornographic(m));
}
