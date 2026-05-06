/**
 * Recommendation history stored in localStorage.
 *
 * Saves past AI recommendations so users can revisit them
 * without making new API calls.
 */

export interface HistoryEntry {
  title: string;
  year: number;
  genre: string;
  description: string;
  rating: number;
  ageRating: string;
  posterUrl: string;
  timestamp: number;
}

const STORAGE_KEY = 'cinetrivia-history';
const MAX_ENTRIES = 20;

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();

    // Don't add duplicates
    const exists = history.some(
      (h) => h.title.toLowerCase() === entry.title.toLowerCase() && h.year === entry.year
    );
    if (exists) return;

    const newEntry: HistoryEntry = { ...entry, timestamp: Date.now() };
    const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be full or disabled — fail silently
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
