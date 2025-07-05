"use client";

import Image from "next/image";
import { useState } from "react";
import { Movie } from "@/lib/movies";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { FunFactButton } from "./fun-fact-button";
import { getMoviePoster } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";

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
        // Fallback to placeholder if generation fails, to avoid trying again
        setDialogPosterUrl(movie.posterUrl); 
      } finally {
        setIsDialogPosterLoading(false);
      }
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-1 cursor-pointer">
          <CardContent className="flex-grow p-4">
            <CardTitle className="text-lg mb-1 truncate">{movie.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 flex-wrap">
              <span>{movie.year}</span>
              <Badge variant="outline">{movie.genre}</Badge>
              <Badge variant="secondary">{movie.ageRating}</Badge>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <StarRating initialRating={rating} onRate={setRating} />
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="aspect-[2/3] relative w-full rounded-lg overflow-hidden self-center">
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
        <div className="flex flex-col py-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-3xl mb-2">{movie.title} ({movie.year})</DialogTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                <Badge variant="outline">{movie.genre}</Badge>
                <Badge variant="secondary">{movie.ageRating}</Badge>
            </div>
            <DialogDescription>
              {movie.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col justify-center items-center gap-4 my-auto">
            <StarRating initialRating={rating} onRate={setRating} totalStars={5} />
            <span className="font-bold text-lg text-primary">{movie.rating.toFixed(1)}/10</span>
          </div>
          <DialogFooter className="mt-auto">
            <FunFactButton movieTitle={movie.title} />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
