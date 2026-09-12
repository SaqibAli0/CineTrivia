/**
 * Shared types & constants for movie search.
 *
 * Kept out of the `'use server'` action file because Next.js only allows
 * async function exports from a "use server" module.
 */

import { type Movie } from './movies';

/** Minimum query length before we hit TMDB. Keeps request volume down. */
export const MIN_QUERY_LENGTH = 2;

/**
 * How many "display pages" the user can page through (each is RESULTS_PER_PAGE
 * results). "Load more" advances one display page.
 */
export const MAX_SEARCH_PAGE = 2;

/** Target number of results shown per display page. */
export const RESULTS_PER_PAGE = 20;

/**
 * Safety cap on how many raw TMDB pages a single display page may pull while
 * backfilling filtered-out results. Prevents a runaway loop for queries where
 * many results get filtered. TMDB pages have 20 raw results each, so 3 pages
 * is plenty to fill 20 safe results.
 */
export const MAX_TMDB_PAGES_PER_REQUEST = 3;

/** Max characters accepted from the search box. */
export const MAX_QUERY_LENGTH = 200;

/** Debounce delay (ms) for the live search dropdown. */
export const SEARCH_DEBOUNCE_MS = 300;

/** Number of results shown in the inline dropdown. */
export const DROPDOWN_RESULT_COUNT = 3;

export interface SearchMoviesResult {
  movies: Movie[];
  page: number;
  totalPages: number;
  totalResults: number;
  hasMore: boolean;
  /**
   * True when the movie service (TMDB) couldn't be reached at all, as opposed
   * to a successful search that simply had no matches. Lets the UI show a
   * "temporarily unavailable" message instead of "no results found".
   */
  unavailable?: boolean;
}

export const EMPTY_SEARCH_RESULT: SearchMoviesResult = {
  movies: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
  hasMore: false,
};

/** Result signalling that the movie service is unreachable (network/DNS block). */
export const UNAVAILABLE_SEARCH_RESULT: SearchMoviesResult = {
  ...EMPTY_SEARCH_RESULT,
  unavailable: true,
};
