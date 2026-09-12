'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Film, Loader2, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface MovieUnavailableProps {
  title: string;
  year: number;
  slug: string;
}

/** Max automatic retries before we stop and show the manual screen. */
const MAX_AUTO_RETRIES = 3;
/** Backoff before each auto-retry (ms). Grows so a flaky/cold connection warms up. */
const RETRY_DELAYS_MS = [1500, 3000, 4500];

/**
 * Shown when a movie EXISTS but TMDB was temporarily unreachable for this
 * render. Instead of a dead-end "unavailable" message, it auto-retries the
 * request (via router.refresh(), which re-runs the server component) a few
 * times with backoff — mimicking a manual refresh, which usually succeeds on
 * a slow/cold connection. After MAX_AUTO_RETRIES it shows a manual fallback.
 *
 * Attempts are tracked in sessionStorage keyed by slug so a successful load
 * (or navigating away) resets the counter, and we can never loop forever.
 */
export function MovieUnavailable({ title, year, slug }: MovieUnavailableProps) {
  const router = useRouter();
  const storageKey = `cinetrivia:movie-retry:${slug}`;
  const [attempt, setAttempt] = useState<number | null>(null); // null until we read storage
  const scheduled = useRef(false);

  // Read how many times we've already auto-retried this slug.
  useEffect(() => {
    let current = 0;
    try {
      current = Number(sessionStorage.getItem(storageKey) || '0');
    } catch {
      current = 0;
    }
    setAttempt(current);
  }, [storageKey]);

  // Schedule one auto-retry if we still have attempts left.
  useEffect(() => {
    if (attempt === null) return; // still reading storage
    if (attempt >= MAX_AUTO_RETRIES) return; // gave up — show manual screen
    if (scheduled.current) return; // don't schedule twice
    scheduled.current = true;

    const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, String(attempt + 1));
      } catch {
        /* sessionStorage unavailable — retry once without persistence */
      }
      // Re-run the server component. If the fetch now succeeds, the real movie
      // page renders and this component unmounts. If it fails again, we come
      // back here with an incremented attempt count.
      router.refresh();
    }, delay);

    return () => clearTimeout(timer);
  }, [attempt, router, storageKey]);

  function retryNow() {
    try {
      sessionStorage.setItem(storageKey, '0'); // reset so auto-retry runs again
    } catch {
      /* ignore */
    }
    scheduled.current = false;
    setAttempt(0);
    router.refresh();
  }

  const isRetrying = attempt !== null && attempt < MAX_AUTO_RETRIES;

  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="py-16 sm:py-24 text-center max-w-lg mx-auto space-y-4">
          <Film className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <h1 className="font-headline text-2xl sm:text-3xl text-foreground">
            {title} ({year})
          </h1>

          {isRetrying ? (
            <>
              <p className="flex items-center justify-center gap-2 text-muted-foreground text-sm sm:text-base">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading movie details… retrying ({attempt! + 1}/{MAX_AUTO_RETRIES})
              </p>
              <p className="text-muted-foreground text-xs">
                The movie database is responding slowly. Hang tight.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm sm:text-base">
                We couldn&apos;t load this movie&apos;s details right now — the movie
                database is temporarily unavailable.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={retryNow}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-primary/40 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
