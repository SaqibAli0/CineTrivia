'use client';

import { useEffect } from 'react';

/**
 * Clears the MediaUnavailable auto-retry counter for a path once the detail
 * page renders successfully, so a later transient failure gets a fresh set of
 * auto-retries. Mirrors RetryReset but keyed by the full path (TV/animation).
 */
export function MediaRetryReset({ path }: { path: string }) {
  useEffect(() => {
    try {
      sessionStorage.removeItem(`cinetrivia:media-retry:${path}`);
    } catch {
      /* sessionStorage unavailable */
    }
  }, [path]);

  return null;
}
