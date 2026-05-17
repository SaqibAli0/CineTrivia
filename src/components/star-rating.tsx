"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // 0-10 scale
  maxStars?: number;
  size?: "sm" | "md";
}

/**
 * Visual star rating display.
 * Converts a 0-10 rating to filled/half/empty stars.
 */
export function StarRating({ rating, maxStars = 5, size = "sm" }: StarRatingProps) {
  const normalized = (rating / 10) * maxStars; // Convert 0-10 to 0-5
  const full = Math.floor(normalized);
  const hasHalf = normalized - full >= 0.25;
  const empty = maxStars - full - (hasHalf ? 1 : 0);

  const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className="flex items-center gap-0.5">
      {/* Full stars */}
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className={`${starSize} fill-terracotta text-terracotta`} />
      ))}
      {/* Half star */}
      {hasHalf && (
        <div className="relative">
          <Star className={`${starSize} text-parchment/20`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${starSize} fill-terracotta text-terracotta`} />
          </div>
        </div>
      )}
      {/* Empty stars */}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSize} text-parchment/20`} />
      ))}
      <span className="mono-font text-parchment/60 ml-1.5">{rating.toFixed(1)}</span>
    </div>
  );
}
