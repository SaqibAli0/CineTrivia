/**
 * Client-side movie pool stored in IndexedDB.
 *
 * Accumulates movies up to 100 in the user's browser.
 * Once full, the homepage shuffles from this local pool
 * without any server/API calls.
 */

import type { Movie } from './movies';

const DB_NAME = 'CineTriviaMovies';
const DB_VERSION = 1;
const STORE_NAME = 'pool';
const META_KEY = 'pool_meta';
const POOL_TARGET = 100;

interface PoolMeta {
  count: number;
  isFull: boolean;
  lastUpdated: number;
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    };
  });
}

/**
 * Get pool metadata (count, isFull status)
 */
export async function getPoolMeta(): Promise<PoolMeta | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('meta', 'readonly');
      const store = tx.objectStore('meta');
      const request = store.get(META_KEY);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

/**
 * Get all movies from the pool
 */
export async function getPoolMovies(): Promise<Movie[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as Movie[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * Add movies to the pool (deduplicates by ID).
 * Returns the updated count.
 */
export async function addToPool(movies: Movie[]): Promise<number> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME, 'meta'], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const metaStore = tx.objectStore('meta');

      // Add each movie (put = upsert, won't duplicate)
      for (const movie of movies) {
        store.put(movie);
      }

      // Count total after adding
      const countReq = store.count();
      countReq.onsuccess = () => {
        const count = Math.min(countReq.result, POOL_TARGET);
        const isFull = count >= POOL_TARGET;

        const meta: PoolMeta = { count, isFull, lastUpdated: Date.now() };
        metaStore.put(meta, META_KEY);

        resolve(count);
      };

      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return 0;
  }
}

/**
 * Check if the pool is full (has 100 movies)
 */
export async function isPoolFull(): Promise<boolean> {
  const meta = await getPoolMeta();
  return meta?.isFull ?? false;
}

/**
 * Get a shuffled subset from the pool
 */
export async function getShuffledMovies(count: number = 20): Promise<Movie[]> {
  const movies = await getPoolMovies();
  if (movies.length === 0) return [];

  // Fisher-Yates shuffle
  const shuffled = [...movies];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * Clear the pool (for debugging)
 */
export async function clearPool(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_NAME, 'meta'], 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.objectStore('meta').delete(META_KEY);
  } catch {
    // fail silently
  }
}
