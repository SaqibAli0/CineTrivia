"use client";

import { MovieCardSkeleton } from "./movie-card-skeleton";

export function MovieGridSkeleton() {
  return (
    <div className="space-y-10">
      <div>
        <div className="h-9 w-64 bg-muted rounded-full mb-2" />
        <div className="h-4 w-80 bg-muted rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
