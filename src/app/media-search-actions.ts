'use server';

import { tmdbFetch, TMDBUnreachableError } from '@/lib/tmdb-client';
import { isPornographic } from '@/lib/content-filter';
import { tmdbMovieToMediaItem } from '@/lib/media';
import { searchShows } from '@/lib/tvmaze';
import { ServerCache, ONE_HOUR } from '@/ai/services/cache';
import type { TMDBMovie } from '@/lib/tmdb';
import type { MediaItem } from '@/lib/media';
import {
  MediaSearchResult,
  EMPTY_MEDIA_SEARCH,
  UNAVAILABLE_MEDIA_SEARCH,
} from '@/lib/media-search';
import { MIN_QUERY_LENGTH, MAX_QUERY_LENGTH, RESULTS_PER_PAGE } from '@/lib/search';

/** Per-query cache so identical searches within the TTL cost nothing. */
const cache = new ServerCache<MediaSearchResult>(200);

/** Simple per-minute limiter, mirroring searchMovies. */
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
  results: TMDBMovie[];
}

async function searchTmdbMovies(query: string): Promise<MediaItem[]> {
  const data = await tmdbFetch<TMDBSearchResponse>('/search/movie', {
    params: { query, page: '1' },
    revalidate: 3600,
  });
  const seen = new Set<number>();
  const items: MediaItem[] = [];
  for (const m of data.results) {
    if (seen.has(m.id)) continue;
    const year = m.release_date ? parseInt(m.release_date.split('-')[0], 10) : 0;
    if (!year) continue;
    try {
      if (isPornographic(m)) continue;
    } catch {
      continue; // fail closed
    }
    seen.add(m.id);
    items.push(tmdbMovieToMediaItem(m));
  }
  return items;
}

export type MediaSearchScope = 'all' | 'movie' | 'tv' | 'animation';

/**
 * Search across movies (TMDB) and TV/animation (TVmaze `/search/shows`) at
 * once, returning normalized `MediaItem`s that each link via `basePath`+source.
 *
 * Scope filters the sources queried:
 *  - 'all'       → movies + shows (animated + non-animated)
 *  - 'movie'     → TMDB movies only
 *  - 'tv'        → TVmaze non-animation shows only
 *  - 'animation' → animated shows (TVmaze) only (animated films need a TMDB
 *                  genre filter and are surfaced on the /animation browse page)
 *
 * Zero-cost: min-length guard, per-query cache, capped to one page per source.
 */
export async function searchMedia(
  rawQuery: string,
  scope: MediaSearchScope = 'all',
  targetCount = RESULTS_PER_PAGE
): Promise<MediaSearchResult> {
  const query = (rawQuery ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  if (query.length < MIN_QUERY_LENGTH) return EMPTY_MEDIA_SEARCH;

  const wantCount = Math.min(Math.max(Math.floor(targetCount) || RESULTS_PER_PAGE, 1), RESULTS_PER_PAGE);
  const cacheKey = `v1|${scope}|${query.toLowerCase()}|${wantCount}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!rateLimiter.check(30)) return EMPTY_MEDIA_SEARCH;

  // Movies are queried for 'movie', 'all', AND 'animation' (animated films
  // come from TMDB — TVmaze is TV-only), then filtered to animated for the
  // animation scope below.
  const wantMovies = scope === 'all' || scope === 'movie' || scope === 'animation';
  const wantShows = scope === 'all' || scope === 'tv' || scope === 'animation';
  const animationOnly = scope === 'animation';

  const [moviesR, showsR] = await Promise.allSettled([
    wantMovies ? searchTmdbMovies(query) : Promise.resolve<MediaItem[]>([]),
    wantShows ? searchShows(query, animationOnly) : Promise.resolve<MediaItem[]>([]),
  ]);

  const movies = moviesR.status === 'fulfilled' ? moviesR.value : [];
  let shows = showsR.status === 'fulfilled' ? showsR.value : [];

  // For the plain 'tv' scope, exclude animated series (they live under /animation).
  if (scope === 'tv') shows = shows.filter((s) => !s.isAnimation);

  // Scope the movie results:
  //  - 'movie'     → drop animated films (they belong under /animation)
  //  - 'animation' → keep ONLY animated films
  //  - 'all'/'tv'  → as-is
  let scopedMovies = movies;
  if (scope === 'movie') scopedMovies = movies.filter((m) => !m.isAnimation);
  else if (scope === 'animation') scopedMovies = movies.filter((m) => m.isAnimation);

  // Detect "both sources unreachable": the only failure mode we surface as
  // unavailable. If either succeeded (even empty), it's a normal result.
  const tmdbDown =
    wantMovies && moviesR.status === 'rejected' && moviesR.reason instanceof TMDBUnreachableError;
  const showsDown = wantShows && showsR.status === 'rejected';
  if ((!wantMovies || tmdbDown) && (!wantShows || showsDown) && (tmdbDown || showsDown)) {
    return UNAVAILABLE_MEDIA_SEARCH;
  }

  // Interleave so both types appear near the top for 'all'.
  const items: MediaItem[] = [];
  const seen = new Set<string>();
  const push = (m?: MediaItem) => {
    if (!m) return;
    const key = `${m.source}-${m.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(m);
  };
  const max = Math.max(scopedMovies.length, shows.length);
  for (let i = 0; i < max && items.length < wantCount; i++) {
    push(scopedMovies[i]);
    push(shows[i]);
  }

  const result: MediaSearchResult = { items: items.slice(0, wantCount), unavailable: false };
  cache.set(cacheKey, result, ONE_HOUR);
  return result;
}
