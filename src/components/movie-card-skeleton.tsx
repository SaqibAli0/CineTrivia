export function MovieCardSkeleton() {
  return (
    <div className="spec-card p-5">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 border-b border-bordercolor pb-2">
        <div className="h-3 w-20 skeleton-shimmer rounded-sm" />
        <div className="h-3 w-10 skeleton-shimmer rounded-sm" />
      </div>
      {/* Poster area */}
      <div className="aspect-[2/3] w-full skeleton-shimmer mb-4" />
      {/* Title */}
      <div className="h-6 w-3/4 skeleton-shimmer rounded-sm mb-2" />
      {/* Meta */}
      <div className="flex justify-between pt-2 border-t border-bordercolor border-dashed">
        <div className="h-3 w-24 skeleton-shimmer rounded-sm" />
        <div className="h-3 w-16 skeleton-shimmer rounded-sm" />
      </div>
    </div>
  );
}
