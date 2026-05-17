"use client";

import { MovieCardSkeleton } from "./movie-card-skeleton";

export function MovieGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="h-8 w-64 bg-muted mb-2" />
        <div className="h-3 w-48 bg-muted" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
