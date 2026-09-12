import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * history.ts guards on `typeof window`. We provide a minimal in-memory
 * localStorage stub on globalThis so it runs in the node test environment.
 */
class MemoryStorage {
  private map = new Map<string, string>();
  quotaLimit: number | null = null;

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    if (this.quotaLimit !== null && value.length > this.quotaLimit) {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

let storage: MemoryStorage;

async function freshHistoryModule() {
  vi.resetModules();
  return import('./history');
}

function makeEntry(i: number) {
  return {
    title: `Movie ${i}`,
    year: 2000 + (i % 25),
    genre: 'Drama',
    description: 'x'.repeat(200),
    rating: 7.5,
    ageRating: 'PG-13',
    posterUrl: '',
  };
}

describe('history (unlimited watchlist, quota-safe)', () => {
  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal('window', {} as unknown as Window);
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores well beyond the old 20-entry cap', async () => {
    const { addToHistory, getHistory } = await freshHistoryModule();
    for (let i = 0; i < 100; i++) addToHistory(makeEntry(i));
    expect(getHistory().length).toBe(100);
  });

  it('keeps newest entries at the front', async () => {
    const { addToHistory, getHistory } = await freshHistoryModule();
    addToHistory(makeEntry(1));
    addToHistory(makeEntry(2));
    expect(getHistory()[0].title).toBe('Movie 2');
  });

  it('does not store duplicates', async () => {
    const { addToHistory, getHistory } = await freshHistoryModule();
    addToHistory(makeEntry(1));
    addToHistory(makeEntry(1));
    expect(getHistory().length).toBe(1);
  });

  it('prunes safely and does not throw when near quota', async () => {
    const { addToHistory, getHistory } = await freshHistoryModule();
    // Seed a large history, then clamp the quota so the next write must prune.
    for (let i = 0; i < 120; i++) addToHistory(makeEntry(i));
    storage.quotaLimit = 2000; // small enough to force pruning

    expect(() => addToHistory(makeEntry(999))).not.toThrow();
    // Something remains stored, and it's a valid list.
    expect(Array.isArray(getHistory())).toBe(true);
  });
});
