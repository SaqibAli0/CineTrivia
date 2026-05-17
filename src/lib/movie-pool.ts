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
const POOL_TTL_MS = 6 * 60 * 60 * 1000; // Refresh pool every 6 hours for variety

interface MoviePool {
  movies: TMDBMovie[];
  isFull: boolean;
  createdAt: number;
}

// In-memory pool (survives across requests in the same server process)
let memoryPool: MoviePool | null = null;

function isPoolExpired(pool: MoviePool): boolean {
  return Date.now() - pool.createdAt > POOL_TTL_MS;
}

function getPool(): MoviePool | null {
  if (memoryPool && !isPoolExpired(memoryPool)) return memoryPool;

  // Pool expired — clear it so we refill with fresh movies
  if (memoryPool && isPoolExpired(memoryPool)) {
    memoryPool = null;
  }

  const cached = getDevCache<MoviePool>(POOL_CACHE_KEY);
  if (cached && !isPoolExpired(cached)) {
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
  const currentYear = new Date().getFullYear();
  let pool = getPool();

  // Filter out future movies (no rating available yet)
  function filterReleased(movies: TMDBMovie[]): TMDBMovie[] {
    return movies.filter((m) => {
      if (!m.release_date) return true;
      const year = parseInt(m.release_date.split('-')[0], 10);
      return year <= currentYear;
    });
  }

  // Pool is full — just shuffle and return
  if (pool && pool.isFull) {
    return shuffle(filterReleased(pool.movies)).slice(0, count);
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

    pool = { movies: trimmed, isFull, createdAt: pool?.createdAt ?? Date.now() };
    savePool(pool);

    return shuffle(filterReleased(trimmed)).slice(0, count);
  } catch (error) {
    console.error('Failed to fetch movies for pool:', error);

    if (pool && pool.movies.length > 0) {
      return shuffle(filterReleased(pool.movies)).slice(0, count);
    }

    return [];
  }
}
