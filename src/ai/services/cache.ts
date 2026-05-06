/**
 * Server-side in-memory cache with TTL support.
 *
 * Used to avoid repeated API calls for the same data.
 * Fun facts are cached permanently (they never change for a given movie).
 * Recommendations are cached with a 1-hour TTL.
 * Poster URLs are cached permanently.
 *
 * In production, this should be backed by Firestore or Redis
 * so it survives deploys. For now, in-memory is a big improvement
 * over no caching at all.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // null = never expires
}

class ServerCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    // Evict oldest entries if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  get size(): number {
    return this.store.size;
  }
}

// Fun facts never expire — same movie always gets the same cached fact
export const funFactCache = new ServerCache<string>(200);

// Recommendations expire after 1 hour
export const recommendationResponseCache = new ServerCache<any>(100);

// Poster URLs never expire
export const posterUrlCache = new ServerCache<string>(300);

// TTL constants
export const ONE_HOUR = 60 * 60 * 1000;
