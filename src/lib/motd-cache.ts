/**
 * IndexedDB cache for Movie of the Day.
 * Keeps the daily pick stable across page refreshes within the same UTC day.
 */

const DB_NAME = 'cinetrivia';
const STORE_NAME = 'motd';
const DB_VERSION = 1;

export interface CachedDailyMovie {
  title: string;
  year: number;
  posterUrl: string;
  rating: number;
  genre: string;
  overview: string;
  date: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Read cached movie. Returns null if cache is empty or from a different day.
 */
export async function getCachedMOTD(todayDate: string): Promise<CachedDailyMovie | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get('current');

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.date === todayDate) {
          resolve(result as CachedDailyMovie);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Write today's movie to cache.
 */
export async function setCachedMOTD(movie: CachedDailyMovie): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: 'current', ...movie });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Silently fail — not critical
  }
}
