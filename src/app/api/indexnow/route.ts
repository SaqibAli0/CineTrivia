import { NextRequest, NextResponse } from 'next/server';
import { SITE_URL, INDEXNOW_KEY } from '@/lib/site';
import { pingIndexNow } from '@/lib/indexnow';

/**
 * Trigger an IndexNow submission.
 *
 * Auth: pass the IndexNow key as `?key=` (or `x-indexnow-key` header) so this
 * endpoint can't be abused to spam submissions from your domain.
 *
 * Usage:
 *   POST /api/indexnow?key=<KEY>            → submits the core section pages
 *   POST /api/indexnow?key=<KEY>            with JSON body { "urls": ["https://.../tv/x-2016"] }
 *
 * Handy after a deploy (a Netlify post-deploy hook can curl this) or when a new
 * page goes live. Google ignores IndexNow, but Bing/Yandex pick it up fast.
 */
export const dynamic = 'force-dynamic';

const DEFAULT_URLS = [
  SITE_URL,
  `${SITE_URL}/tv`,
  `${SITE_URL}/animation`,
  `${SITE_URL}/genre`,
  `${SITE_URL}/blog`,
];

function authorized(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get('key') || req.headers.get('x-indexnow-key');
  return Boolean(INDEXNOW_KEY) && key === INDEXNOW_KEY;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let urls = DEFAULT_URLS;
  try {
    const body = await req.json();
    if (Array.isArray(body?.urls) && body.urls.length > 0) {
      urls = body.urls;
    }
  } catch {
    // No/invalid body — fall back to the default section pages.
  }

  const result = await pingIndexNow(urls);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

// Allow a simple GET trigger for the default pages too (still key-gated).
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await pingIndexNow(DEFAULT_URLS);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
