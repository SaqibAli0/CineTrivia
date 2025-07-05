"use client";

import { useState, useMemo } from "react";
import type { Movie } from "@/lib/movies";
import { MovieCard } from "./movie-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MovieGridProps {
  movies: Movie[];
}

export function MovieGrid({ movies }: MovieGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return movies;
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [movies, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search movies by title or genre..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search movies"
        />
      </div>
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg font-semibold">No movies found</p>
          <p className="text-muted-foreground">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
