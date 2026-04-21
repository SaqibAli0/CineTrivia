"use client";

import Image from "next/image";
import { useState } from "react";
import { Movie } from "@/lib/movies";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { FunFactButton } from "./fun-fact-button";
import { getMoviePoster } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const [rating, setRating] = useState(Math.round(movie.rating / 2));
  const [dialogPosterUrl, setDialogPosterUrl] = useState("");
  const [isDialogPosterLoading, setIsDialogPosterLoading] = useState(false);

  const needsPosterGeneration = movie.posterUrl.includes('placehold.co');

  const handleOpenChange = async (open: boolean) => {
    if (open && needsPosterGeneration && !dialogPosterUrl) {
      setIsDialogPosterLoading(true);
      try {
        const result = await getMoviePoster({
          title: movie.title,
          description: movie.description,
          genre: movie.genre,
        });
        if (result.posterDataUri) {
          setDialogPosterUrl(result.posterDataUri);
        }
      } catch (e) {
        console.error("Failed to generate poster for", movie.title, e);
        setDialogPosterUrl(movie.posterUrl);
      } finally {
        setIsDialogPosterLoading(false);
      }
    }
  };

  const genreLabel = movie.genre.toUpperCase();

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="group cursor-pointer">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted mb-5">
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="secondary" className="bg-background/90 text-[10px] tracking-wider font-medium uppercase px-3 py-1 rounded-full border-0">
                {genreLabel}
              </Badge>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            {movie.posterUrl && !movie.posterUrl.includes('placehold.co') ? (
              <Image
                src={movie.posterUrl}
                alt={`Poster for ${movie.title}`}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <h3 className="font-headline text-xl md:text-2xl text-foreground mb-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>{movie.year}</span>
            {movie.director && (
              <>
                <span>•</span>
                <span>{movie.director}</span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {movie.description}
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 p-0 overflow-hidden rounded-[2rem] border-0 bg-card">
        <div className="aspect-[2/3] relative w-full overflow-hidden bg-muted">
          {isDialogPosterLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <Image
              src={dialogPosterUrl || movie.posterUrl}
              alt={`Poster for ${movie.title}`}
              fill
              sizes="(max-width: 768px) 90vw, 40vw"
              className="object-cover"
              data-ai-hint={`${movie.genre} movie poster`}
            />
          )}
        </div>
        <div className="flex flex-col p-8 md:pl-0 md:py-8 md:pr-8">
          <DialogHeader className="text-left space-y-0 gap-0 mb-6">
            <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-3">
              {movie.year} &nbsp;&bull;&nbsp; {movie.genre} &nbsp;&bull;&nbsp; {movie.ageRating}
            </p>
            <DialogTitle className="font-headline text-3xl md:text-4xl mb-3 leading-tight">
              {movie.title}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base leading-relaxed text-muted-foreground">
              {movie.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-5 mb-8">
            <StarRating initialRating={rating} onRate={setRating} totalStars={5} />
            <div className="h-4 w-px bg-border" />
            <span className="font-bold text-lg text-primary">{movie.rating.toFixed(1)}<span className="text-muted-foreground font-normal">/10</span></span>
          </div>

          <DialogFooter className="mt-auto flex justify-start sm:justify-start pt-6 border-t border-border/40">
            <FunFactButton movieTitle={movie.title} />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
