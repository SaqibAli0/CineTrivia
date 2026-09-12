/**
 * Recommendation history stored in localStorage.
 *
 * Saves past AI recommendations so users can revisit them
 * without making new API calls.
 *
 * "Unlimited watchlist history" ships free for everyone. Because this is
 * localStorage-only (no backend, zero-cost), there is no bypass-proof way to
 * gate it — so we simply give it to all users. We keep a large safety cap and
 * prune-on-quota so a runaway history can never break the app.
 *
 * FUTURE PAYWALL (documented, not built): a real per-user paid tier would need
 * a server check — e.g. Firebase Auth + Firestore (free tier) storing history
 * server-side and enforcing limits there. Only a server can enforce a limit a
 * user can't flip in devtools. See docs/growth-search-monetization-plan.md.
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

/**
 * Large safety cap (effectively "unlimited" for normal use) to avoid ever
 * hitting the ~5MB localStorage quota. Combined with prune-on-quota below.
 */
const MAX_ENTRIES = 1000;

/** How many oldest entries to drop when we hit a quota error, then retry. */
const PRUNE_STEP = 50;

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

/**
 * Persist the list, pruning oldest entries and retrying if localStorage throws
 * a quota error. Newest entries are at the front, so we drop from the end.
 */
function persist(entries: HistoryEntry[]): void {
  let toStore = entries.slice(0, MAX_ENTRIES);

  while (toStore.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      return;
    } catch {
      // Likely QuotaExceededError — drop the oldest chunk and try again.
      if (toStore.length <= PRUNE_STEP) {
        // Give up gracefully rather than looping forever.
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore.slice(0, 1)));
        } catch {
          /* localStorage disabled — nothing more we can do */
        }
        return;
      }
      toStore = toStore.slice(0, toStore.length - PRUNE_STEP);
    }
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
    persist([newEntry, ...history]);
  } catch {
    // localStorage might be disabled — fail silently
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
