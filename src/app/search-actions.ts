'use server';

import { toMovie, type Movie } from '@/lib/movies';
import { type TMDBMovie } from '@/lib/tmdb';
import { isPornographic } from '@/lib/content-filter';
import { tmdbFetch, TMDBUnreachableError } from '@/lib/tmdb-client';
import { ServerCache, ONE_HOUR } from '@/ai/services/cache';
import {
  MIN_QUERY_LENGTH,
  MAX_SEARCH_PAGE,
  MAX_QUERY_LENGTH,
  RESULTS_PER_PAGE,
  MAX_TMDB_PAGES_PER_REQUEST,
  EMPTY_SEARCH_RESULT,
  UNAVAILABLE_SEARCH_RESULT,
  type SearchMoviesResult,
} from '@/lib/search';

/**
 * Per-query result cache. Keyed by `query|page` so identical searches within
 * the TTL make zero additional TMDB calls. In-memory + ephemeral by design
 * (zero-cost — no DB), which is fine for a dedupe/debounce cache.
 */
const searchCache = new ServerCache<SearchMoviesResult>(200);

/** Simple per-minute rate limiter, mirroring src/app/actions.ts. */
const rateLimiter = {
  requests: [] as number[],
  check(maxPerMinute = 30): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((t) => now - t < 60_000);
    if (this.requests.length >= maxPerMinute) return false;
    this.requests.push(now);
    return true;
  },
};



interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

async function fetchSearch(query: string, page: number): Promise<TMDBSearchResponse> {
  // Uses the shared, key-safe client (timeout + retry, sanitized errors).
  return tmdbFetch<TMDBSearchResponse>('/search/movie', {
    params: { query, page: String(page) },
    revalidate: 3600,
  });
}

/**
 * Keep only results with a valid release year and that pass the content-safety
 * check. Posters are optional (MovieCard shows a placeholder). Fail CLOSED: if
 * the safety check throws, drop that item rather than risk showing adult content.
 */
function safeUsableMovies(results: TMDBMovie[]): Movie[] {
  const isSafe = (m: TMDBMovie): boolean => {
    try {
      return !isPornographic(m);
    } catch {
      return false;
    }
  };

  return results
    .filter((m) => {
      const year = m.release_date ? parseInt(m.release_date.split('-')[0], 10) : 0;
      return year > 0;
    })
    .filter(isSafe)
    .map(toMovie);
}

/**
 * Search TMDB for movies, mapped to the app `Movie` shape.
 *
 * Fills up to `targetCount` SAFE results (default 20) per display page by
 * pulling a bounded block of raw TMDB pages and backfilling the items removed
 * by the content filter — so the page still shows a full 20 even after
 * pornographic/undated titles are dropped.
 *
 * Frugality: min-length guard (no fetch), per-query cache, and at most
 * MAX_TMDB_PAGES_PER_REQUEST fetches per call (stops as soon as the target
 * is met, so a clean query costs just one fetch).
 */
export async function searchMovies(
  rawQuery: string,
  rawDisplayPage = 1,
  targetCount: number = RESULTS_PER_PAGE
): Promise<SearchMoviesResult> {
  const query = (rawQuery ?? '').trim().slice(0, MAX_QUERY_LENGTH);

  // Too short (or empty) — never touch TMDB.
  if (query.length < MIN_QUERY_LENGTH) {
    return EMPTY_SEARCH_RESULT;
  }

  // Clamp the display page into the allowed range.
  const displayPage = Math.min(Math.max(Math.floor(rawDisplayPage) || 1, 1), MAX_SEARCH_PAGE);

  // Desired safe-result count for this call (dropdown asks for fewer → fewer
  // TMDB fetches). Never exceed a full display page.
  const wantCount = Math.min(Math.max(Math.floor(targetCount) || RESULTS_PER_PAGE, 1), RESULTS_PER_PAGE);

  // Cache key is versioned (v3) and includes the target count so the small
  // dropdown fill and the full page fill don't collide.
  const cacheKey = `v3|${query.toLowerCase()}|${displayPage}|${wantCount}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  if (!rateLimiter.check(30)) {
    // Under load, fail soft with an empty result rather than throwing.
    return EMPTY_SEARCH_RESULT;
  }

  // Each display page maps to a block of raw TMDB pages, so we can backfill the
  // ~1-3 items lost per page to filtering and still show a full RESULTS_PER_PAGE.
  const firstTmdbPage = (displayPage - 1) * MAX_TMDB_PAGES_PER_REQUEST + 1;

  const collected: Movie[] = [];
  const seen = new Set<number>();
  let tmdbTotalPages = 1;
  let tmdbTotalResults = 0;
  let fetchedAny = false;

  try {
    for (let i = 0; i < MAX_TMDB_PAGES_PER_REQUEST; i++) {
      const tmdbPage = firstTmdbPage + i;

      // TMDB itself only serves up to 500 pages; also stop if we've run out.
      if (tmdbPage > 500) break;

      const data = await fetchSearch(query, tmdbPage);
      fetchedAny = true;
      tmdbTotalPages = data.total_pages;
      tmdbTotalResults = data.total_results;

      for (const movie of safeUsableMovies(data.results)) {
        if (seen.has(movie.id)) continue;
        seen.add(movie.id);
        collected.push(movie);
      }

      // Stop early once we've filled the target or exhausted TMDB's pages.
      if (collected.length >= wantCount) break;
      if (tmdbPage >= data.total_pages) break;
    }

    const movies = collected.slice(0, wantCount);

    // There's another display page if TMDB still has pages beyond what we've
    // consumed AND we're under the display-page cap.
    const lastConsumedTmdbPage = firstTmdbPage + MAX_TMDB_PAGES_PER_REQUEST - 1;
    const hasMore =
      displayPage < MAX_SEARCH_PAGE &&
      lastConsumedTmdbPage < tmdbTotalPages &&
      movies.length > 0;

    const result: SearchMoviesResult = {
      movies,
      page: displayPage,
      totalPages: Math.min(MAX_SEARCH_PAGE, Math.ceil(tmdbTotalPages / MAX_TMDB_PAGES_PER_REQUEST)),
      totalResults: tmdbTotalResults,
      hasMore,
    };

    // Only cache a real (fetched) result.
    if (fetchedAny) searchCache.set(cacheKey, result, ONE_HOUR);
    return result;
  } catch (error) {
    // Network/DNS block → tell the UI the service is unavailable.
    if (error instanceof TMDBUnreachableError) {
      return UNAVAILABLE_SEARCH_RESULT;
    }
    // Any other error (e.g. HTTP 4xx) — safe, sanitized log; no URL/key.
    console.warn('[searchMovies]', error instanceof Error ? error.name : 'error');
    return EMPTY_SEARCH_RESULT;
  }
}
