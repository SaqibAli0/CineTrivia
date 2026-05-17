'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { toSlug } from '@/lib/slug';
import { getCachedMOTD, setCachedMOTD, type CachedDailyMovie } from '@/lib/motd-cache';

interface MovieOfTheDayProps {
  title: string;
  year: number;
  posterUrl: string;
  rating: number;
  genre: string;
  overview: string;
  director: string;
  runtime: number;
  date: string;
}

export function MovieOfTheDay({ title, year, posterUrl, rating, genre, overview, director, runtime, date }: MovieOfTheDayProps) {
  const [movie, setMovie] = useState<CachedDailyMovie>({ title, year, posterUrl, rating, genre, overview, date });

  useEffect(() => {
    async function syncCache() {
      try {
        const cached = await getCachedMOTD(date);
        if (cached) {
          setMovie(cached);
        } else {
          const toCache: CachedDailyMovie = { title, year, posterUrl, rating, genre, overview, date };
          await setCachedMOTD(toCache);
        }
      } catch {}
    }
    syncCache();
  }, [title, year, posterUrl, rating, genre, overview, date]);

  const slug = toSlug(movie.title, movie.year);
  const titleWords = movie.title.split(' ');
  // Last word gets terracotta color
  const lastWord = titleWords.pop() || '';
  const mainTitle = titleWords.join(' ');

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-bordercolor pb-16">
      {/* Left — Image card */}
      <div className="lg:col-span-5 spec-card p-4 relative">
        <div className="flex justify-between mb-4 mono-font text-parchment/60">
          <span>Movie of the Day</span>
          <span>Daily Pick</span>
        </div>

        <Link href={`/movie/${slug}`} className="visual-preview w-full aspect-[2/3] max-w-[320px] bg-black/40 relative block mx-auto">
          <div className="crosshair-corner cc-tl" />
          <div className="crosshair-corner cc-tr" />
          <div className="crosshair-corner cc-bl" />
          <div className="crosshair-corner cc-br" />
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover image-filter opacity-80"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <ImageIcon className="w-16 h-16 text-parchment/20" />
            </div>
          )}

          {/* Center badge */}
          <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="badge-circle bg-charcoal/80 backdrop-blur-sm">
              <svg className="badge-text" viewBox="0 0 100 100">
                <path id="circlePathHero" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                <text>
                  <textPath xlinkHref="#circlePathHero">
                    • FEATURED SELECTION • ARCHIVAL RECORD •
                  </textPath>
                </text>
              </svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c17a5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Right — Info */}
      <div className="lg:col-span-7 flex flex-col justify-center pt-4 lg:pt-0 lg:pl-8">
        <div className="mono-font text-terracotta mb-4 border-b border-bordercolor inline-block pb-2 w-fit">
          Featured Today
        </div>

        <Link href={`/movie/${slug}`}>
          <h1 className="display-font text-5xl md:text-6xl lg:text-[80px] text-parchment mb-6">
            {mainTitle && <>{mainTitle}<br /></>}
            <span className="text-terracotta">{lastWord}</span>
          </h1>
        </Link>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-y border-bordercolor py-6">
          <div>
            <div className="mono-font text-parchment/50 mb-1">Director</div>
            <div className="display-font text-xl text-parchment tracking-wide">{director || '—'}</div>
          </div>
          <div>
            <div className="mono-font text-parchment/50 mb-1">Year</div>
            <div className="display-font text-xl text-parchment tracking-wide">{movie.year}</div>
          </div>
          <div>
            <div className="mono-font text-parchment/50 mb-1">Runtime</div>
            <div className="display-font text-xl text-parchment tracking-wide">{runtime ? `${runtime} min` : '—'}</div>
          </div>
          <div>
            <div className="mono-font text-parchment/50 mb-1">Rating</div>
            <div className="display-font text-xl tracking-wide rating-badge inline-block px-2 py-0.5">{movie.rating.toFixed(1)}</div>
          </div>
        </div>

        {/* Description */}
        <p className="mono-font text-parchment/80 leading-relaxed text-[11px] max-w-2xl text-justify">
          {movie.overview}
        </p>

        {/* Buttons */}
        <div className="mt-8 flex gap-4">
          <Link
            href={`/movie/${slug}`}
            className="border border-terracotta text-terracotta mono-font px-6 py-3 hover:bg-terracotta hover:text-charcoal transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            View Details
          </Link>
        </div>
      </div>
    </section>
  );
}
