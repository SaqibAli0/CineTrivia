/**
 * TMDB (The Movie Database) API Client
 *
 * Provides dynamic movie collections using TMDB's free API.
 * Supports popular, top-rated, and genre-based discovery with
 * randomized pagination for variety on each visit.
 */

import { isPornographic } from './content-filter';
import { tmdbFetch, TMDBUnreachableError } from './tmdb-client';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Poster sizes available from TMDB CDN
export const POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original',
} as const;

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  /** TMDB's own adult flag. True for titles flagged as pornographic. */
  adult?: boolean;
}

interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// TMDB genre ID mapping
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// Genre IDs grouped for discovery rotation
const GENRE_COMBOS = [
  [28, 878],       // Action + Sci-Fi
  [18, 53],        // Drama + Thriller
  [35, 10749],     // Comedy + Romance
  [14, 12],        // Fantasy + Adventure
  [80, 9648],      // Crime + Mystery
  [27, 53],        // Horror + Thriller
  [18, 36],        // Drama + History
  [28, 12],        // Action + Adventure
];

/**
 * Build a full poster URL from TMDB's poster_path
 */
export function getPosterUrl(posterPath: string | null, size: keyof typeof POSTER_SIZES = 'large'): string {
  if (!posterPath) {
    return '';
  }
  return `${TMDB_IMAGE_BASE}/${POSTER_SIZES[size]}${posterPath}`;
}

/**
 * Map TMDB genre IDs to readable genre string
 */
export function getGenreLabel(genreIds: number[]): string {
  const names = genreIds
    .slice(0, 2)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean);
  return names.join(' / ') || 'Drama';
}

/**
 * Pick a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Re-export so existing imports of TMDBUnreachableError keep working.
export { TMDBUnreachableError } from './tmdb-client';

/**
 * Fetch movies from a TMDB endpoint via the shared, key-safe client.
 *
 * `fast` uses a short timeout + single attempt so homepage/collection fetches
 * fail QUICKLY (~5s) and fall back to cached/fallback content, instead of
 * hanging ~45s on the patient default when TMDB is unreachable. Detail pages
 * (a user clicked, expecting to wait) keep the patient default.
 */
async function fetchFromTMDB(
  endpoint: string,
  params: Record<string, string> = {},
  fast = false
): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>(endpoint, {
    params,
    revalidate: 3600,
    ...(fast ? { timeoutMs: 5000, maxAttempts: 1 } : {}),
  });
}

/**
 * Get popular movies with a random page for variety
 */
export async function getPopularMovies(page?: number): Promise<TMDBMovie[]> {
  const p = page ?? randomInt(1, 15);
  const data = await fetchFromTMDB('/movie/popular', { page: String(p) }, true);
  return data.results;
}

/**
 * Get top-rated movies with a random page
 */
export async function getTopRatedMovies(page?: number): Promise<TMDBMovie[]> {
  const p = page ?? randomInt(1, 15);
  const data = await fetchFromTMDB('/movie/top_rated', { page: String(p) }, true);
  return data.results;
}

/**
 * Discover movies by genre combination
 */
export async function discoverMovies(genreIds?: number[], page?: number): Promise<TMDBMovie[]> {
  const genres = genreIds ?? GENRE_COMBOS[randomInt(0, GENRE_COMBOS.length - 1)];
  const p = page ?? randomInt(1, 10);

  const data = await fetchFromTMDB('/discover/movie', {
    page: String(p),
    with_genres: genres.join(','),
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
  }, true);

  return data.results;
}

/**
 * Search TMDB for a movie by title.
 * Useful for finding poster URLs for AI-recommended movies.
 */
export async function searchMovie(title: string, year?: number): Promise<TMDBMovie | null> {
  const params: Record<string, string> = { query: title };
  if (year) {
    params.year = String(year);
  }

  const data = await fetchFromTMDB('/search/movie', params);

  if (data.results.length === 0) {
    return null;
  }

  return data.results[0];
}

export interface VerifiedMovie {
  title: string;
  year: number;
  rating: number;
  genre: string;
  overview: string;
  posterUrl: string;
}

/**
 * Verify an AI-suggested movie against TMDB.
 *
 * Tries an exact title+year match first, then falls back to a title-only
 * search (the AI often hallucinates the year). Returns the real TMDB record
 * so callers can correct a hallucinated year/rating/poster, or null when no
 * confident match exists.
 */
export async function verifyMovie(title: string, year?: number): Promise<VerifiedMovie | null> {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const target = normalize(title);

  try {
    // 1) Title + year (most precise).
    let candidates: TMDBMovie[] = [];
    if (year) {
      const withYear = await fetchFromTMDB('/search/movie', { query: title, year: String(year) });
      candidates = withYear.results;
    }

    // 2) Title-only fallback (corrects a hallucinated year).
    if (candidates.length === 0) {
      const titleOnly = await fetchFromTMDB('/search/movie', { query: title });
      candidates = titleOnly.results;
    }

    if (candidates.length === 0) return null;

    // Prefer an exact normalized title match; otherwise take TMDB's top result
    // (results are already relevance-ranked) as long as it has a poster.
    const exact = candidates.find((m) => normalize(m.title) === target && m.poster_path);
    const match = exact ?? candidates.find((m) => m.poster_path) ?? candidates[0];
    if (!match) return null;

    const matchYear = match.release_date
      ? parseInt(match.release_date.split('-')[0], 10)
      : year ?? 0;

    return {
      title: match.title,
      year: matchYear,
      rating: Math.round(match.vote_average * 10) / 10,
      genre: getGenreLabel(match.genre_ids),
      overview: match.overview,
      posterUrl: getPosterUrl(match.poster_path, 'large'),
    };
  } catch (error) {
    // Re-throw when TMDB is unreachable so the caller can tell "network down"
    // apart from "no match found" (null). Otherwise a network blip would look
    // like a failed verification and wrongly discard a good AI pick.
    if (error instanceof TMDBUnreachableError) throw error;
    console.warn('[verifyMovie] failed:', error instanceof Error ? error.name : 'error');
    return null;
  }
}

/**
 * Build a mixed collection of movies for the homepage.
 * Combines popular, top-rated, and genre-based discovery
 * for a fresh set on every visit.
 */
export async function getMovieCollection(count: number = 20): Promise<TMDBMovie[]> {
  try {
    // Fetch from multiple sources in parallel
    const [popular, topRated, discovered] = await Promise.all([
      getPopularMovies(),
      getTopRatedMovies(),
      discoverMovies(),
    ]);

    // Mix: 50% popular, 25% top-rated, 25% discovered
    const popularSlice = popular.slice(0, Math.ceil(count * 0.5));
    const topRatedSlice = topRated.slice(0, Math.ceil(count * 0.25));
    const discoveredSlice = discovered.slice(0, Math.ceil(count * 0.25));

    // Combine and deduplicate by ID
    const seen = new Set<number>();
    const combined: TMDBMovie[] = [];

    for (const movie of [...popularSlice, ...topRatedSlice, ...discoveredSlice]) {
      if (!seen.has(movie.id) && movie.poster_path && !isPornographic(movie)) {
        seen.add(movie.id);
        combined.push(movie);
      }
    }

    // Shuffle the final list
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.slice(0, count);
  } catch (error) {
    console.warn('[tmdb] movie collection unavailable:', error instanceof Error ? error.name : 'error');
    return [];
  }
}
