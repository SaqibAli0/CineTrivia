/**
 * Single, secure TMDB fetch client.
 *
 * Every TMDB request in the app goes through here so that:
 *  - the API key is attached in ONE place (never duplicated), and
 *  - errors NEVER include the request URL (which carries the api_key query
 *    param). We only ever surface the endpoint path, so the key can't leak
 *    into build logs / error traces.
 *
 * Note: TMDB v3 keys authenticate via the `api_key` query param, so the key
 * still travels in the URL of the actual outbound request — but it is stripped
 * from anything we log or throw.
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Per-attempt network timeout (ms). Generous enough that a COLD connection
 * (fresh DNS + TLS handshake on the first request) can complete — an overly
 * short timeout aborts the first hit and only the warmed-up retry succeeds,
 * which shows up as "fails first, works on refresh".
 */
const DEFAULT_TIMEOUT_MS = 15000;
/** Attempts before giving up on a transient network failure. */
const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Thrown when TMDB's host can't be reached (reset / DNS block / timeout).
 * Distinct from an HTTP error so callers can show a "service unavailable"
 * state. The message is safe to log — it contains no key or full URL.
 */
export class TMDBUnreachableError extends Error {
  constructor(public endpoint: string) {
    super(`TMDB unreachable for ${endpoint}`);
    this.name = 'TMDBUnreachableError';
  }
}

/** Thrown for a real HTTP error response (bad key, rate limit, etc.). */
export class TMDBHttpError extends Error {
  constructor(public status: number, public endpoint: string) {
    super(`TMDB request failed (${status}) for ${endpoint}`);
    this.name = 'TMDBHttpError';
  }
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error('TMDB_API_KEY is not configured');
  return key;
}

interface TmdbFetchOptions {
  params?: Record<string, string>;
  /** Next.js fetch cache options. Defaults to a 1-hour revalidate. */
  revalidate?: number;
  timeoutMs?: number;
  maxAttempts?: number;
}

/**
 * Fetch a TMDB endpoint and parse JSON.
 *
 * @param endpoint e.g. "/search/movie" (used in error messages — safe, no key)
 */
export async function tmdbFetch<T>(endpoint: string, options: TmdbFetchOptions = {}): Promise<T> {
  const { params = {}, revalidate = 3600, timeoutMs = DEFAULT_TIMEOUT_MS, maxAttempts = DEFAULT_MAX_ATTEMPTS } = options;

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', getApiKey());
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('include_adult', 'false');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Escalating per-attempt timeout. The first attempt is shorter (so a truly
    // dead network fails reasonably fast); later attempts get more time so a
    // slow COLD connection can still complete rather than being aborted.
    const attemptTimeout = Math.round(timeoutMs * (0.6 + attempt * 0.4));
    try {
      const response = await fetch(url.toString(), {
        next: { revalidate },
        signal: AbortSignal.timeout(attemptTimeout),
      });

      if (response.status === 429) {
        // Rate limited — brief backoff then retry.
        await sleep((attempt + 1) * 1000);
        continue;
      }

      if (!response.ok) {
        // Real HTTP error — do not retry as a network failure.
        throw new TMDBHttpError(response.status, endpoint);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof TMDBHttpError) throw error;
      // Network-level failure (reset / DNS / timeout) — retry.
      lastError = error;
      if (attempt < maxAttempts - 1) await sleep(400 * (attempt + 1));
    }
  }

  // IMPORTANT: never include `url` here — it carries the api_key.
  logSafe(endpoint, lastError);
  throw new TMDBUnreachableError(endpoint);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Whether build-time pre-rendering of TMDB-backed pages should run.
 *
 * Controls the ~100 movie pages + genre fetches in `generateStaticParams`.
 * Priority:
 *   1. SKIP_TMDB_PRERENDER=true  → always skip (fast, quiet local builds).
 *   2. SKIP_TMDB_PRERENDER=false → always pre-render (trust the network).
 *   3. unset → probe TMDB once; skip if unreachable.
 *
 * The env flag is authoritative because a one-shot probe is unreliable on a
 * FLAKY connection: the probe can succeed, committing the build to pre-render
 * ~100 pages, then most of their fetches fail. Set SKIP_TMDB_PRERENDER=true in
 * local `.env` when your network blocks TMDB; leave it unset on Netlify.
 */
let reachablePromise: Promise<boolean> | null = null;
export function shouldPrerenderTmdbPages(): Promise<boolean> {
  const flag = process.env.SKIP_TMDB_PRERENDER;
  if (flag === 'true' || flag === '1') return Promise.resolve(false);
  if (flag === 'false' || flag === '0') return Promise.resolve(true);

  if (reachablePromise) return reachablePromise;
  reachablePromise = (async () => {
    if (!process.env.TMDB_API_KEY) return false;
    try {
      const url = new URL(`${TMDB_BASE_URL}/configuration`);
      url.searchParams.set('api_key', getApiKey());
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(4000) });
      return res.ok;
    } catch {
      return false;
    }
  })();
  return reachablePromise;
}

/** Log only the endpoint + error code — never the URL/key. */
function logSafe(endpoint: string, error: unknown): void {
  const cause = (error as { cause?: { code?: string } })?.cause;
  const code = cause?.code || (error instanceof Error ? error.name : 'unknown');
  console.warn(`[TMDB] ${endpoint} unreachable (${code})`);
}
