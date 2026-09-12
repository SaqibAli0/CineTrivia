'use client';

import { useEffect } from 'react';

/**
 * Clears the MovieUnavailable auto-retry counter for a slug once the movie
 * page has rendered successfully. Ensures a later transient failure on the
 * same movie gets a fresh set of auto-retries instead of a stale count.
 */
export function RetryReset({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      sessionStorage.removeItem(`cinetrivia:movie-retry:${slug}`);
    } catch {
      /* sessionStorage unavailable — nothing to clear */
    }
  }, [slug]);

  return null;
}
