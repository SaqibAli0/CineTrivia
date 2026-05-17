"use client";

import { useState, useMemo, useEffect } from "react";
import type { Movie } from "@/lib/movies";
import { MovieCard } from "./movie-card";
import { MovieCardSkeleton } from "./movie-card-skeleton";
import { Film, ChevronsDown } from "lucide-react";
import { isPoolFull, getShuffledMovies, addToPool } from "@/lib/movie-pool-client";

interface MovieGridProps {
  movies: Movie[];
}

export function MovieGrid({ movies: serverMovies }: MovieGridProps) {
  const [displayMovies, setDisplayMovies] = useState<Movie[]>(serverMovies);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    async function loadMovies() {
      try {
        const [full] = await Promise.all([
          isPoolFull(),
          serverMovies.length > 0 ? addToPool(serverMovies) : Promise.resolve(0),
        ]);
        if (full) {
          const local = await getShuffledMovies(20);
          if (local.length > 0) setDisplayMovies(local);
          else setDisplayMovies(serverMovies.slice(0, 20));
        } else {
          setDisplayMovies(serverMovies.slice(0, 20));
        }
      } catch {
        setDisplayMovies(serverMovies.slice(0, 20));
      } finally {
        setIsLoading(false);
      }
    }
    loadMovies();
  }, [serverMovies]);

  const visibleMovies = displayMovies.slice(0, visibleCount);
  const hasMore = visibleCount < displayMovies.length;

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-bordercolor pb-4">
        <div>
          <h2 className="display-font text-4xl text-parchment">Explore Movies</h2>
          <div className="mono-font text-terracotta mt-1">Showing {displayMovies.length} movies</div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : visibleMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleMovies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleCount((c) => c + 8)}
                className="border border-bordercolor text-parchment mono-font px-8 py-4 hover:border-terracotta hover:text-terracotta transition-all flex items-center gap-3"
              >
                <ChevronsDown className="w-4 h-4" />
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 border border-bordercolor">
          <Film className="w-10 h-10 text-parchment/30 mx-auto mb-4" />
          <p className="mono-font text-parchment">RETRIEVING ASSETS...</p>
        </div>
      )}
    </section>
  );
}
