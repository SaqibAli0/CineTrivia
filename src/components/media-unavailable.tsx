'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clapperboard, Loader2, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface MediaUnavailableProps {
  title: string;
  year: number;
  /** Full detail path (e.g. "/tv/stranger-things-2016") used as the retry key. */
  path: string;
  /** Section label shown in copy, e.g. "TV show" or "title". */
  label?: string;
}

const MAX_AUTO_RETRIES = 3;
const RETRY_DELAYS_MS = [1500, 3000, 4500];

/**
 * Generalized version of MovieUnavailable for TV / animation detail pages.
 * Shown when a title EXISTS but its data source (TVmaze/TMDB) was temporarily
 * unreachable. Auto-retries via router.refresh() with backoff, tracked in
 * sessionStorage keyed by the path, then falls back to a manual screen.
 */
export function MediaUnavailable({ title, year, path, label = 'title' }: MediaUnavailableProps) {
  const router = useRouter();
  const storageKey = `cinetrivia:media-retry:${path}`;
  const [attempt, setAttempt] = useState<number | null>(null);
  const scheduled = useRef(false);

  useEffect(() => {
    let current = 0;
    try {
      current = Number(sessionStorage.getItem(storageKey) || '0');
    } catch {
      current = 0;
    }
    setAttempt(current);
  }, [storageKey]);

  useEffect(() => {
    if (attempt === null) return;
    if (attempt >= MAX_AUTO_RETRIES) return;
    if (scheduled.current) return;
    scheduled.current = true;

    const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, String(attempt + 1));
      } catch {
        /* sessionStorage unavailable */
      }
      router.refresh();
    }, delay);

    return () => clearTimeout(timer);
  }, [attempt, router, storageKey]);

  function retryNow() {
    try {
      sessionStorage.setItem(storageKey, '0');
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
          <Clapperboard className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <h1 className="font-headline text-2xl sm:text-3xl text-foreground">
            {title} {year > 0 ? `(${year})` : ''}
          </h1>

          {isRetrying ? (
            <>
              <p className="flex items-center justify-center gap-2 text-muted-foreground text-sm sm:text-base">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading details… retrying ({attempt! + 1}/{MAX_AUTO_RETRIES})
              </p>
              <p className="text-muted-foreground text-xs">
                The data service is responding slowly. Hang tight.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm sm:text-base">
                We couldn&apos;t load this {label}&apos;s details right now — the data
                service is temporarily unavailable.
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
