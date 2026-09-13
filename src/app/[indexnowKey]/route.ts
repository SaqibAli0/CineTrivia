import { INDEXNOW_KEY } from '@/lib/site';

/**
 * Serves the IndexNow ownership-verification key file at `/<key>.txt` WITHOUT
 * hardcoding the key in the source tree — the key lives only in the
 * INDEXNOW_KEY env var. IndexNow verifies domain ownership by fetching this
 * file and checking it contains the key.
 *
 * This dynamic segment only responds for the exact `<key>.txt` path; every
 * other single-segment path 404s here and falls through to the real routes
 * (Next matches static/defined routes before this catch-all segment anyway).
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ indexnowKey: string }> }
) {
  const { indexnowKey } = await params;

  // Only serve when configured AND the requested file matches the key exactly.
  if (!INDEXNOW_KEY || indexnowKey !== `${INDEXNOW_KEY}.txt`) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(INDEXNOW_KEY, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
