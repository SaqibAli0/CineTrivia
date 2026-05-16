import Image from 'next/image';
import Link from 'next/link';
import { Star, ImageIcon } from 'lucide-react';
import type { SimilarMovie } from '@/lib/tmdb-details';

interface SimilarMoviesGridProps {
  movies: SimilarMovie[];
}

export function SimilarMoviesGrid({ movies }: SimilarMoviesGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
      {movies.map((movie) => (
        <Link
          key={movie.id}
          href={`/movie/${movie.slug}`}
          className="group block"
        >
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted border border-border group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-lg">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            {/* Rating pill */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-border/50">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-[10px] font-bold text-foreground">{movie.rating}</span>
            </div>

            {/* Bottom gradient on hover */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-xs text-foreground font-medium">{movie.genre}</p>
            </div>
          </div>

          <div className="mt-2.5">
            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {movie.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{movie.year}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
