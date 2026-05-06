"use client";

import { useState, useMemo } from "react";
import type { Movie } from "@/lib/movies";
import { MovieCard } from "./movie-card";
import { Search, Film } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MovieGridProps {
  movies: Movie[];
}

export function MovieGrid({ movies }: MovieGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return movies;
    const q = searchQuery.toLowerCase();
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(q) ||
        movie.genre.toLowerCase().includes(q)
    );
  }, [movies, searchQuery]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-headline text-3xl md:text-4xl text-foreground mb-2">
          Explore Our Collection
        </h2>
        <p className="text-muted-foreground text-sm">
          Curated selections spanning genres, eras, and emotions.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search movies by title or genre..."
          className="pl-9 bg-card border-border/60 rounded-full text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search movies"
        />
      </div>

      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : movies.length === 0 ? (
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
