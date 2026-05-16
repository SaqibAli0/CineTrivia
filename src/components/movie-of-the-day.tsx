'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Sparkles, ImageIcon, ArrowRight } from 'lucide-react';
import { toSlug } from '@/lib/slug';
import { getCachedMOTD, setCachedMOTD, type CachedDailyMovie } from '@/lib/motd-cache';

interface MovieOfTheDayProps {
  /** Server-fetched movie data (used as source of truth if cache is stale) */
  title: string;
  year: number;
  posterUrl: string;
  rating: number;
  genre: string;
  overview: string;
  /** Today's date in UTC (YYYY-MM-DD) */
  date: string;
}

/**
 * Movie of the Day — premium featured section.
 * 
 * Behavior:
 * - Server provides today's movie (deterministic based on UTC date)
 * - Client caches it in IndexedDB
 * - On refresh, IndexedDB is checked first — if same date, use cached version
 * - This ensures the movie NEVER changes within the same day
 */
export function MovieOfTheDay({ title, year, posterUrl, rating, genre, overview, date }: MovieOfTheDayProps) {
  const [movie, setMovie] = useState<CachedDailyMovie>({ title, year, posterUrl, rating, genre, overview, date });

  useEffect(() => {
    async function syncCache() {
      try {
        // Check if we have a cached version for today
        const cached = await getCachedMOTD(date);
        if (cached) {
          // Use cached version (ensures no change on refresh)
          setMovie(cached);
        } else {
          // Cache the server-provided movie
          const toCache: CachedDailyMovie = { title, year, posterUrl, rating, genre, overview, date };
          await setCachedMOTD(toCache);
        }
      } catch {
        // IndexedDB unavailable — just use server data
      }
    }

    syncCache();
  }, [title, year, posterUrl, rating, genre, overview, date]);

  const slug = toSlug(movie.title, movie.year);

  return (
    <section className="relative rounded-2xl overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

      {/* Backdrop image (blurred) */}
      {movie.posterUrl && (
        <div className="absolute inset-0 opacity-[0.08]">
          <Image
            src={movie.posterUrl}
            alt=""
            fill
            className="object-cover blur-2xl scale-110"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20" />

      {/* Content */}
      <div className="relative flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
        {/* Poster */}
        <Link href={`/movie/${slug}`} className="shrink-0 mx-auto sm:mx-0 group">
          <div className="relative w-[150px] sm:w-[180px] md:w-[200px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300 group-hover:scale-[1.02]">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                fill
                sizes="200px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            {/* Shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
          {/* Badge */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Movie of the Day
              </span>
            </span>
          </div>

          {/* Title */}
          <Link href={`/movie/${slug}`} className="group">
            <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-foreground group-hover:text-primary transition-colors leading-tight">
              {movie.title}
            </h3>
            <span className="text-muted-foreground text-base sm:text-lg mt-1 inline-block">
              ({movie.year})
            </span>
          </Link>

          {/* Meta */}
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
            {movie.rating > 0 && (
              <span className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-2.5 py-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-sm font-bold">{movie.rating}</span>
                <span className="text-xs text-muted-foreground">/10</span>
              </span>
            )}
            <span className="text-sm text-muted-foreground font-medium">{movie.genre}</span>
          </div>

          {/* Overview */}
          <p className="text-sm sm:text-[15px] text-muted-foreground mt-4 leading-relaxed">
            {movie.overview}
          </p>

          {/* CTA Button */}
          <Link
            href={`/movie/${slug}`}
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all hover:gap-3 w-fit mx-auto sm:mx-0 shadow-lg shadow-primary/20"
          >
            Explore this movie
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
