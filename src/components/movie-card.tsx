"use client";

import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/lib/movies";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Star } from "lucide-react";
import { toSlug } from "@/lib/slug";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const hasPoster = Boolean(movie.posterUrl);
  const slug = toSlug(movie.title, movie.year);

  return (
    <Link href={`/movie/${slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden bg-muted mb-3 sm:mb-4 ring-1 ring-border/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
        {/* Genre badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-sm text-[9px] sm:text-[10px] tracking-wider font-medium uppercase px-2 sm:px-2.5 py-0.5 rounded-full border-0"
          >
            {movie.genre.split(' / ')[0].toUpperCase()}
          </Badge>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-[10px] sm:text-xs font-semibold text-foreground">
              {movie.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Poster */}
        {hasPoster ? (
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
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
          <p className="text-white text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        </div>
      </div>

      {/* Title & meta */}
      <h3 className="font-headline text-sm sm:text-base md:text-lg text-foreground mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
        {movie.title}
      </h3>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
        <span>{movie.year}</span>
        <span>•</span>
        <span className="truncate">{movie.genre}</span>
      </div>
    </Link>
  );
}
