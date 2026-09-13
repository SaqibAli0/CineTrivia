/**
 * Single, key-safe TVmaze fetch client.
 *
 * Mirrors `tmdb-client.ts` so every TVmaze request in the app funnels through
 * one place with consistent timeouts, retries, 429 back-off, and safe logging.
 *
 * TVmaze notes:
 *  - The PUBLIC tier needs NO API key (https://api.tvmaze.com). Everything the
 *    app uses — search, show details, seasons, cast — is on the free tier.
 *  - TVmaze asks callers to be polite: ~20 calls per 10 seconds. We add a
 *    descriptive User-Agent and back off on HTTP 429.
 *  - A `TVMAZE_API_KEY` is OPTIONAL. If set, it's sent via HTTP Basic auth
 *    (how TVmaze's premium tier authenticates). The app works fully without it;
 *    the key only unlocks premium endpoints we don't currently need. As with
 *    the TMDB key, it is NEVER included in anything we log or throw.
 *  - TVmaze serves its own responses with a 60-minute cache, so we mirror that
 *    with a 1-hour Next.js `revalidate` by default.
 */

const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

/** Descriptive UA so TVmaze can identify well-behaved traffic. */
const USER_AGENT = 'CineTrivia/1.0 (+https://cinetrivia.netlify.app)';

/**
 * Per-attempt network timeout (ms). Matches the TMDB client's rationale: a
 * cold DNS+TLS handshake on the first request needs headroom, so escalate.
 */
const DEFAULT_TIMEOUT_MS = 15000;
/** Attempts before giving up on a transient network failure. */
const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Thrown when TVmaze's host can't be reached (reset / DNS block / timeout).
 * Distinct from an HTTP error so callers can show a "service unavailable"
 * state. The message is safe to log — no key or full URL.
 */
export class TVmazeUnreachableError extends Error {
  constructor(public endpoint: string) {
    super(`TVmaze unreachable for ${endpoint}`);
    this.name = 'TVmazeUnreachableError';
  }
}

/** Thrown for a real HTTP error response (rate limit, 404, etc.). */
export class TVmazeHttpError extends Error {
  constructor(public status: number, public endpoint: string) {
    super(`TVmaze request failed (${status}) for ${endpoint}`);
    this.name = 'TVmazeHttpError';
  }
}

/**
 * Optional premium key → HTTP Basic auth header. Returns undefined on the
 * public (keyless) tier, which is the normal path. Never logged.
 */
function getAuthHeader(): Record<string, string> {
  const key = process.env.TVMAZE_API_KEY;
  if (!key) return {};
  // TVmaze premium uses HTTP Basic auth (username = key, empty password).
  const token = Buffer.from(`${key}:`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

interface TvmazeFetchOptions {
  params?: Record<string, string>;
  /** Next.js fetch cache options. Defaults to a 1-hour revalidate. */
  revalidate?: number;
  timeoutMs?: number;
  maxAttempts?: number;
}

/**
 * Fetch a TVmaze endpoint and parse JSON.
 *
 * @param endpoint e.g. "/shows/1" or "/search/shows" (used in error messages —
 *   safe, no key). Query params go through `options.params`.
 */
export async function tvmazeFetch<T>(endpoint: string, options: TvmazeFetchOptions = {}): Promise<T> {
  const { params = {}, revalidate = 3600, timeoutMs = DEFAULT_TIMEOUT_MS, maxAttempts = DEFAULT_MAX_ATTEMPTS } = options;

  const url = new URL(`${TVMAZE_BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = {
    'User-Agent': USER_AGENT,
    Accept: 'application/json',
    ...getAuthHeader(),
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Escalating per-attempt timeout: first attempt shorter (dead network
    // fails fast), later attempts get more time for a slow cold connection.
    const attemptTimeout = Math.round(timeoutMs * (0.6 + attempt * 0.4));
    try {
      const response = await fetch(url.toString(), {
        headers,
        next: { revalidate },
        signal: AbortSignal.timeout(attemptTimeout),
      });

      if (response.status === 429) {
        // Rate limited (TVmaze allows ~20 calls/10s) — back off then retry.
        await sleep((attempt + 1) * 1000);
        continue;
      }

      if (!response.ok) {
        // Real HTTP error (e.g. 404 for an unknown show) — don't retry as a
        // network failure.
        throw new TVmazeHttpError(response.status, endpoint);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof TVmazeHttpError) throw error;
      // Network-level failure (reset / DNS / timeout) — retry.
      lastError = error;
      if (attempt < maxAttempts - 1) await sleep(400 * (attempt + 1));
    }
  }

  logSafe(endpoint, lastError);
  throw new TVmazeUnreachableError(endpoint);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Whether build-time pre-rendering of TVmaze-backed pages should run.
 *
 * Mirrors `shouldPrerenderTmdbPages`. Priority:
 *   1. SKIP_TVMAZE_PRERENDER=true  → always skip.
 *   2. SKIP_TVMAZE_PRERENDER=false → always pre-render.
 *   3. unset → probe TVmaze once; skip if unreachable.
 */
let reachablePromise: Promise<boolean> | null = null;
export function shouldPrerenderTvmazePages(): Promise<boolean> {
  const flag = process.env.SKIP_TVMAZE_PRERENDER;
  if (flag === 'true' || flag === '1') return Promise.resolve(false);
  if (flag === 'false' || flag === '0') return Promise.resolve(true);

  if (reachablePromise) return reachablePromise;
  reachablePromise = (async () => {
    try {
      const res = await fetch(`${TVMAZE_BASE_URL}/shows/1`, {
        headers: { 'User-Agent': USER_AGENT, ...getAuthHeader() },
        signal: AbortSignal.timeout(4000),
      });
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
  console.warn(`[TVmaze] ${endpoint} unreachable (${code})`);
}
