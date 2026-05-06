/**
 * File-based cache for development mode.
 *
 * In dev, Next.js doesn't honor ISR revalidation — every request
 * hits the origin. This cache prevents repeated TMDB calls during
 * local development by writing responses to the .next/cache folder.
 *
 * Only active when NODE_ENV === 'development'.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = join(process.cwd(), '.next', 'dev-cache');
const TTL_MS = 30 * 60 * 1000; // 30 minutes in dev

interface CachedData {
  data: any;
  timestamp: number;
}

function ensureDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCachePath(key: string): string {
  // Simple hash to create a safe filename
  const safe = key.replace(/[^a-z0-9]/gi, '_').slice(0, 80);
  return join(CACHE_DIR, `${safe}.json`);
}

export function getDevCache<T>(key: string): T | null {
  if (process.env.NODE_ENV !== 'development') return null;

  try {
    const path = getCachePath(key);
    if (!existsSync(path)) return null;

    const raw = readFileSync(path, 'utf-8');
    const cached: CachedData = JSON.parse(raw);

    if (Date.now() - cached.timestamp > TTL_MS) {
      return null; // Expired
    }

    return cached.data as T;
  } catch {
    return null;
  }
}

export function setDevCache(key: string, data: any): void {
  if (process.env.NODE_ENV !== 'development') return;

  try {
    ensureDir();
    const path = getCachePath(key);
    const entry: CachedData = { data, timestamp: Date.now() };
    writeFileSync(path, JSON.stringify(entry));
  } catch {
    // Non-critical — just skip caching
  }
}
