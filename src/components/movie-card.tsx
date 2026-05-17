"use client";

import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/lib/movies";
import { ImageIcon, TrendingUp } from "lucide-react";
import { toSlug } from "@/lib/slug";
import { StarRating } from "./star-rating";

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const hasPoster = Boolean(movie.posterUrl);
  const slug = toSlug(movie.title, movie.year);
  const isTrending = movie.rating >= 8.0;

  return (
    <Link href={`/movie/${slug}`} className="spec-card p-5 group cursor-pointer block">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 mono-font text-parchment/50 border-b border-bordercolor pb-2">
        <span>{movie.year}</span>
        {movie.rating === 0 ? (
          <span className="text-parchment/40 text-[9px]">Coming soon</span>
        ) : isTrending ? (
          <span className="flex items-center gap-1 text-terracotta">
            <TrendingUp className="w-3 h-3" />
            <span className="text-[9px]">Trending</span>
          </span>
        ) : (
          <StarRating rating={movie.rating} />
        )}
      </div>

      {/* Image — full poster aspect ratio */}
      <div className="visual-preview aspect-[2/3] bg-black/30 mb-4 relative overflow-hidden">
        <div className="crosshair-corner cc-tl" />
        <div className="crosshair-corner cc-tr" />
        <div className="crosshair-corner cc-bl" />
        <div className="crosshair-corner cc-br" />
        {hasPoster ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover image-filter"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40">
            <div className="w-16 h-16 border border-terracotta/30 flex items-center justify-center">
              <span className="display-font text-3xl text-terracotta/60">{movie.title.charAt(0)}</span>
            </div>
          </div>
        )}

        {/* Hover overlay with description */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-4">
          <p className="mono-font text-parchment/90 text-[10px] leading-relaxed line-clamp-4">
            {movie.description}
          </p>
        </div>
      </div>

      {/* Title + meta */}
      <div>
        <h3 className="display-font text-2xl sm:text-3xl text-parchment mb-1 group-hover:text-terracotta transition-colors truncate">
          {movie.title}
        </h3>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-bordercolor border-dashed">
          {movie.rating > 0 ? (
            <StarRating rating={movie.rating} />
          ) : (
            <span className="mono-font text-parchment/40 text-[9px]">Not yet rated</span>
          )}
          <span className="mono-font genre-pill px-2 py-0.5 text-[9px]">{movie.genre}</span>
        </div>
      </div>
    </Link>
  );
}
