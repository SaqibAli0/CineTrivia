/**
 * IndexNow client — instant crawl notifications for Bing, Yandex, Seznam, and
 * other IndexNow-participating engines. Google does NOT participate, but this
 * is a free, standards-based way to get faster discovery on the engines that
 * do, and it costs nothing.
 *
 * Ownership is proven by the static key file served at `/<key>.txt`
 * (src/app/<key>.txt/route.ts). We only submit URLs on our own host.
 */

import { SITE_URL, INDEXNOW_KEY } from './site';

/** The generic IndexNow endpoint (fans out to all participating engines). */
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
  skipped?: string;
}

/**
 * Submit one or more URLs to IndexNow. URLs must be absolute and on SITE_URL's
 * host (IndexNow rejects cross-host submissions). Returns a small result object
 * instead of throwing so callers can log without crashing a request.
 */
export async function pingIndexNow(urls: string[]): Promise<IndexNowResult> {
  if (!INDEXNOW_KEY) {
    return { ok: false, status: 0, submitted: 0, skipped: 'no INDEXNOW_KEY' };
  }

  const host = new URL(SITE_URL).host;
  // Keep only same-host absolute URLs (IndexNow requirement).
  const urlList = Array.from(
    new Set(
      urls
        .map((u) => u.trim())
        .filter(Boolean)
        .filter((u) => {
          try {
            return new URL(u).host === host;
          } catch {
            return false;
          }
        })
    )
  );

  if (urlList.length === 0) {
    return { ok: false, status: 0, submitted: 0, skipped: 'no valid same-host URLs' };
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(10000),
    });
    // 200 = accepted, 202 = accepted (queued). Both are success.
    return { ok: res.ok, status: res.status, submitted: urlList.length };
  } catch (error) {
    console.warn('[indexnow] ping failed:', error instanceof Error ? error.name : 'error');
    return { ok: false, status: 0, submitted: 0, skipped: 'network error' };
  }
}
