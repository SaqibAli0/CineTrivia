/**
 * IndexedDB utility for storing movie posters persistently
 * Posters persist across browser sessions and only clear when user explicitly clears browser data
 */

const DB_NAME = 'CineTriviaPosters';
const DB_VERSION = 1;
const STORE_NAME = 'posters';

export interface PosterEntry {
  title: string;
  posterDataUri: string;
  timestamp: number;
}

/**
 * Initialize IndexedDB database
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'title' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Get poster from IndexedDB by movie title
 */
export async function getPoster(title: string): Promise<string | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(title);

      request.onsuccess = () => {
        const entry = request.result as PosterEntry | undefined;
        resolve(entry?.posterDataUri || null);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting poster from IndexedDB:', error);
    return null;
  }
}

/**
 * Save poster to IndexedDB
 */
export async function savePoster(title: string, posterDataUri: string): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const entry: PosterEntry = {
        title,
        posterDataUri,
        timestamp: Date.now(),
      };

      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving poster to IndexedDB:', error);
  }
}

/**
 * Clear all posters from IndexedDB (for user-initiated cleanup)
 */
export async function clearAllPosters(): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing posters from IndexedDB:', error);
  }
}

/**
 * Get all stored poster entries (for debugging/management)
 */
export async function getAllPosters(): Promise<PosterEntry[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as PosterEntry[]);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting all posters from IndexedDB:', error);
    return [];
  }
}
