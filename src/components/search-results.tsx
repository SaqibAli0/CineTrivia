"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { MovieCard } from "./movie-card";
import { Button } from "@/components/ui/button";
import { searchMovies } from "@/app/search-actions";
import type { Movie } from "@/lib/movies";
import { MAX_SEARCH_PAGE } from "@/lib/search";

interface SearchResultsProps {
  query: string;
  initialMovies: Movie[];
  initialHasMore: boolean;
  initialUnavailable?: boolean;
}

/**
 * Client-side results grid with an optional "Load more" that fetches page 2
 * only when the user clicks it. Page is hard-capped at MAX_SEARCH_PAGE.
 */
export function SearchResults({
  query,
  initialMovies,
  initialHasMore,
  initialUnavailable = false,
}: SearchResultsProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadMore() {
    if (loading || page >= MAX_SEARCH_PAGE) return;
    setLoading(true);
    setNotice(null);
    try {
      const nextPage = page + 1;
      const res = await searchMovies(query, nextPage);

      // Dedupe by id in case TMDB overlaps pages.
      const seen = new Set(movies.map((m) => m.id));
      const fresh = res.movies.filter((m) => !seen.has(m.id));

      if (res.unavailable) {
        // Network blip — keep the button so the user can retry.
        setNotice("Couldn't load more right now. Please try again.");
        return;
      }

      if (fresh.length === 0) {
        // Genuinely nothing new on the next page — stop offering more.
        setHasMore(false);
        setNotice("That's everything we found for this search.");
        setPage(nextPage);
        return;
      }

      setMovies([...movies, ...fresh]);
      setPage(nextPage);
      // Only offer another page if TMDB has one AND we're under the cap.
      setHasMore(res.hasMore && nextPage < MAX_SEARCH_PAGE);
    } finally {
      setLoading(false);
    }
  }

  if (initialUnavailable && movies.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-lg font-medium text-foreground">
          Movie search is temporarily unavailable
        </p>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          We couldn&apos;t reach the movie database right now. This can happen if the
          TMDB API is blocked on your network — try again shortly, or switch your
          DNS/VPN if it persists.
        </p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-lg font-medium text-foreground">
          No movies found for &ldquo;{query}&rdquo;
        </p>
        <p className="text-muted-foreground text-sm">
          Try a different title or check the spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            className="animate-item-in"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {notice && (
        <p className="text-center text-sm text-muted-foreground">{notice}</p>
      )}

      {hasMore && page < MAX_SEARCH_PAGE && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full px-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
