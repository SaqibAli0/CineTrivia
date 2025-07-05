"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  initialRating: number;
  totalStars?: number;
  onRate: (rating: number) => void;
}

export function StarRating({
  initialRating,
  totalStars = 5,
  onRate,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || initialRating);

        return (
          <button
            key={starValue}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            onClick={() => onRate(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            className="p-0 bg-transparent border-none cursor-pointer"
          >
            <Star
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                isFilled ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
