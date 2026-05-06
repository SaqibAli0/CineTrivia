"use client";

import Image from "next/image";
import { useState } from "react";
import { Movie } from "@/lib/movies";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { FunFactButton } from "./fun-fact-button";
import { ImageIcon } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const [rating, setRating] = useState(Math.round(movie.rating / 2));
  const hasPoster = Boolean(movie.posterUrl);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group cursor-pointer">
          <div className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-muted mb-3 sm:mb-5">
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
              <Badge
                variant="secondary"
                className="bg-background/90 text-[9px] sm:text-[10px] tracking-wider font-medium uppercase px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border-0"
              >
                {movie.genre.toUpperCase()}
              </Badge>
            </div>
            {hasPoster ? (
              <Image
                src={movie.posterUrl}
                alt={`Poster for ${movie.title}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground opacity-50" />
              </div>
            )}
          </div>
          <h3 className="font-headline text-base sm:text-xl md:text-2xl text-foreground mb-0.5 sm:mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">
            <span>{movie.year}</span>
            {movie.director && (
              <>
                <span>•</span>
                <span className="truncate">{movie.director}</span>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">
            {movie.description}
          </p>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-3xl grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-0 md:gap-10 p-0 overflow-hidden rounded-2xl sm:rounded-[2rem] border-0 bg-card max-h-[85vh] overflow-y-auto">
        <div className="aspect-[4/3] md:aspect-[2/3] relative w-full overflow-hidden bg-muted shrink-0">
          {hasPoster ? (
            <Image
              src={movie.posterUrl}
              alt={`Poster for ${movie.title}`}
              fill
              sizes="(max-width: 768px) 95vw, 40vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground opacity-40" />
            </div>
          )}
        </div>
        <div className="flex flex-col p-5 sm:p-8 md:pl-0 md:py-8 md:pr-8">
          <DialogHeader className="text-left space-y-0 gap-0 mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-[11px] tracking-widest uppercase text-muted-foreground mb-2 sm:mb-3">
              {movie.year} &nbsp;&bull;&nbsp; {movie.genre} &nbsp;&bull;&nbsp; {movie.ageRating}
            </p>
            <DialogTitle className="font-headline text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 leading-tight">
              {movie.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground overflow-y-auto max-h-[120px] sm:max-h-[200px] md:max-h-none">
              {movie.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-8">
            <StarRating initialRating={rating} onRate={setRating} totalStars={5} />
            <div className="h-4 w-px bg-border" />
            <span className="font-bold text-base sm:text-lg text-primary">
              {movie.rating.toFixed(1)}
              <span className="text-muted-foreground font-normal">/10</span>
            </span>
          </div>

          <DialogFooter className="flex justify-start sm:justify-start pt-4 sm:pt-6 border-t border-border/40">
            <FunFactButton movieTitle={movie.title} />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
