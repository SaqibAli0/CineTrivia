"use client";

import { useState, useMemo, useEffect } from "react";
import type { Movie } from "@/lib/movies";
import { MovieCard } from "./movie-card";
import { MovieCardSkeleton } from "./movie-card-skeleton";
import { Search, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { isPoolFull, getShuffledMovies, addToPool } from "@/lib/movie-pool-client";

interface MovieGridProps {
  movies: Movie[]; // Server-provided movies (from TMDB)
}

export function MovieGrid({ movies: serverMovies }: MovieGridProps) {
  const [displayMovies, setDisplayMovies] = useState<Movie[]>(serverMovies);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      try {
        // Run pool check and store operation in parallel
        const [full, _] = await Promise.all([
          isPoolFull(),
          // Always store server movies in background (no-op if duplicates)
          serverMovies.length > 0 ? addToPool(serverMovies) : Promise.resolve(0),
        ]);

        if (full) {
          // Pool is full — shuffle locally, no server data needed
          const local = await getShuffledMovies(20);
          if (local.length > 0) {
            setDisplayMovies(local);
          } else {
            setDisplayMovies(serverMovies.slice(0, 20));
          }
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

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return displayMovies;
    const q = searchQuery.toLowerCase();
    return displayMovies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(q) ||
        movie.genre.toLowerCase().includes(q)
    );
  }, [displayMovies, searchQuery]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl text-foreground mb-2">
          Explore Our Collection
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Curated selections spanning genres, eras, and emotions.
        </p>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title or genre..."
          className="pl-9 bg-card border-border/60 rounded-full text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search movies"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : displayMovies.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Film className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-lg font-medium text-foreground">Collection loading...</p>
          <p className="text-muted-foreground text-sm">Movies will appear here shortly.</p>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg font-medium text-foreground">No movies found</p>
          <p className="text-muted-foreground text-sm">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
