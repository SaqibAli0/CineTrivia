/**
 * Movie Pool
 *
 * Fills up to 100 movies from TMDB, then stops calling the API entirely.
 * Every page load picks a random 20 from the pool — different order each time,
 * zero API cost after the pool is full.
 */

import { getDevCache, setDevCache } from './dev-cache';
import { getMovieCollection, type TMDBMovie } from './tmdb';

const POOL_CACHE_KEY = 'movie_pool_v2';
const POOL_TARGET = 100;

interface MoviePool {
  movies: TMDBMovie[];
  isFull: boolean;
}

// In-memory pool (survives across requests in the same server process)
let memoryPool: MoviePool | null = null;

function getPool(): MoviePool | null {
  if (memoryPool) return memoryPool;

  const cached = getDevCache<MoviePool>(POOL_CACHE_KEY);
  if (cached) {
    memoryPool = cached;
    return cached;
  }

  return null;
}

function savePool(pool: MoviePool): void {
  memoryPool = pool;
  setDevCache(POOL_CACHE_KEY, pool);
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get movies for the homepage.
 *
 * - If pool has 100 movies → shuffle and pick 20 (no API call)
 * - If pool is under 100 → fetch more from TMDB, add to pool, then pick 20
 */
export async function getMoviesFromPool(count: number = 40): Promise<TMDBMovie[]> {
  let pool = getPool();

  // Pool is full — just shuffle and return
  if (pool && pool.isFull) {
    return shuffle(pool.movies).slice(0, count);
  }

  // Pool needs more movies — fetch multiple pages to fill quicker
  try {
    const fetches = [getMovieCollection(20), getMovieCollection(20)];
    const results = await Promise.all(fetches);
    const fresh = results.flat();

    const existing = pool ? new Map(pool.movies.map((m) => [m.id, m])) : new Map<number, TMDBMovie>();

    for (const movie of fresh) {
      if (movie.poster_path) {
        existing.set(movie.id, movie);
      }
    }

    const all = Array.from(existing.values());
    const isFull = all.length >= POOL_TARGET;
    const trimmed = all.slice(0, POOL_TARGET);

    pool = { movies: trimmed, isFull };
    savePool(pool);

    return shuffle(trimmed).slice(0, count);
  } catch (error) {
    console.error('Failed to fetch movies for pool:', error);

    if (pool && pool.movies.length > 0) {
      return shuffle(pool.movies).slice(0, count);
    }

    return [];
  }
}
