import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import type { SimilarMovie } from '@/lib/tmdb-details';

interface SimilarMoviesGridProps {
  movies: SimilarMovie[];
}

export function SimilarMoviesGrid({ movies }: SimilarMoviesGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {movies.map((movie, i) => (
        <Link
          key={movie.id}
          href={`/movie/${movie.slug}`}
          className="spec-card p-4 group cursor-pointer block"
        >
          <div className="flex justify-between mb-3 mono-font text-parchment/40 border-b border-bordercolor pb-2">
            <span>REF_{String(i + 1).padStart(2, '0')}</span>
            <span>{movie.year}</span>
          </div>

          <div className="visual-preview aspect-[2/3] bg-black/30 mb-3 relative">
            <div className="crosshair-corner cc-tl" />
            <div className="crosshair-corner cc-tr" />
            <div className="crosshair-corner cc-bl" />
            <div className="crosshair-corner cc-br" />
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover image-filter"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40">
                <div className="w-12 h-12 border border-terracotta/30 flex items-center justify-center">
                  <span className="display-font text-2xl text-terracotta/60">{movie.title.charAt(0)}</span>
                </div>
              </div>
            )}
          </div>

          <h3 className="display-font text-xl text-parchment group-hover:text-terracotta transition-colors truncate">
            {movie.title}
          </h3>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-bordercolor border-dashed">
            <span className="mono-font text-parchment/50">{movie.year}</span>
            <span className="mono-font text-terracotta">{movie.genre || ''}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
