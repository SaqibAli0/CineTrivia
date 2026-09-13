import { Tv } from "lucide-react";
import type { MediaItem } from "@/lib/media";
import { MediaCard } from "./media-card";

interface MediaGridProps {
  items: MediaItem[];
  /** Message shown when the collection is empty (source unreachable). */
  emptyMessage?: string;
}

/**
 * Simple server-rendered grid of MediaItems (TV / animation landing pages).
 * Unlike MovieGrid it does no client-side pool shuffling — the collection is
 * already shuffled server-side and cached.
 */
export function MediaGrid({ items, emptyMessage = "Titles will appear here shortly." }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Tv className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
        <p className="text-lg font-medium text-foreground">Collection loading…</p>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
      {items.map((item) => (
        <MediaCard key={`${item.source}-${item.id}`} item={item} />
      ))}
    </div>
  );
}
