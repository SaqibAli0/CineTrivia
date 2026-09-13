import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Star } from "lucide-react";
import { mediaHref, mediaTypeLabel, type MediaItem } from "@/lib/media";

interface MediaCardProps {
  item: MediaItem;
}

/**
 * Generalized card for movies, TV shows, and animation. Mirrors MovieCard's
 * visual design but links via `mediaHref` (so a movie goes to /movie, a series
 * to /tv, and animation to /animation) and shows a Movie/TV/Animation badge.
 */
export function MediaCard({ item }: MediaCardProps) {
  const hasPoster = Boolean(item.posterUrl);
  const href = mediaHref(item);
  const typeLabel = mediaTypeLabel(item);
  const genreLabel = item.genre.split(" / ")[0]?.toUpperCase() || typeLabel.toUpperCase();

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden bg-muted mb-3 sm:mb-4 ring-1 ring-border/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
        {/* Type badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
          <Badge
            variant="secondary"
            className="bg-primary/90 text-primary-foreground backdrop-blur-sm text-[9px] sm:text-[10px] tracking-wider font-medium uppercase px-2 sm:px-2.5 py-0.5 rounded-full border-0"
          >
            {typeLabel}
          </Badge>
        </div>

        {/* Rating badge */}
        {item.rating > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-[10px] sm:text-xs font-semibold text-foreground">
                {item.rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Poster */}
        {hasPoster ? (
          <Image
            src={item.posterUrl}
            alt={`Poster for ${item.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground opacity-50" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-[11px] sm:text-xs font-medium uppercase tracking-wide">
            {item.genre}
          </p>
        </div>
      </div>

      {/* Title & meta */}
      <h3 className="font-headline text-sm sm:text-base md:text-lg text-foreground mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
        {item.title}
      </h3>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
        {item.year > 0 && <span>{item.year}</span>}
        {item.year > 0 && <span>•</span>}
        <span className="truncate">{item.genre}</span>
      </div>
    </Link>
  );
}
