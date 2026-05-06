"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-3xl bg-muted mb-5" />
      <Skeleton className="h-6 w-3/4 mb-2 rounded-full" />
      <Skeleton className="h-4 w-1/2 mb-2 rounded-full" />
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-5/6 mt-1 rounded-full" />
    </div>
  );
}
