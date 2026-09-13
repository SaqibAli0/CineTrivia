/**
 * Shared media model for movies, TV shows, and animation.
 *
 * CineTrivia started movie-only (TMDB). To add TV shows and animation as
 * first-class sections we normalize every source into a single `MediaItem`
 * (for cards/grids/search) so the same UI can render a movie, a TV show, or
 * an animated title with the correct link and a type badge.
 *
 * Two axes describe an item:
 *  - `mediaType`: 'movie' | 'tv'  — the underlying content shape (a film vs a
 *    multi-season series). Animated *films* are still `movie`; animated
 *    *series* are still `tv`.
 *  - `source`: 'tmdb' | 'tvmaze' — where the record came from, so a detail
 *    lookup knows which API to re-resolve against.
 *
 * The "Animation" section is a *presentation* grouping, not a media type: it
 * contains both animated films (movie/tmdb) and animated series (tv/tvmaze).
 * `basePath` therefore takes an explicit `isAnimation` flag to decide whether
 * an item links under /movie, /tv, or /animation.
 */

export type MediaType = 'movie' | 'tv';
export type MediaSource = 'tmdb' | 'tvmaze';

/** A normalized card/grid/search item usable across all sections. */
export interface MediaItem {
  /** Numeric id within its `source` (TMDB id or TVmaze id). */
  id: number;
  source: MediaSource;
  mediaType: MediaType;
  title: string;
  /** Release year (movie) or first-air year (tv). 0 when unknown. */
  year: number;
  posterUrl: string;
  /** 0-10 rating, rounded to 1 decimal. 0 when unknown. */
  rating: number;
  /** Human-readable genre label, e.g. "Drama / Thriller". */
  genre: string;
  /** SEO slug ("title-year"). */
  slug: string;
  /**
   * Whether this item belongs in the Animation section. Animated films
   * (TMDB genre 16) and animated/anime-tagged series (TVmaze) set this true.
   */
  isAnimation?: boolean;
}

/**
 * The route base for a media item.
 *
 * Animation is its own section regardless of media type, so an animated film
 * or animated series both live under /animation. Everything else routes by
 * media type: films → /movie, series → /tv.
 */
export function basePath(mediaType: MediaType, isAnimation = false): '/movie' | '/tv' | '/animation' {
  if (isAnimation) return '/animation';
  return mediaType === 'tv' ? '/tv' : '/movie';
}

/**
 * Build the full detail-page href for a media item, e.g.
 * "/tv/stranger-things-2016" or "/animation/spirited-away-2001".
 */
export function mediaHref(item: Pick<MediaItem, 'mediaType' | 'isAnimation' | 'slug'>): string {
  return `${basePath(item.mediaType, item.isAnimation)}/${item.slug}`;
}

/** Short badge label for a media item's card. */
export function mediaTypeLabel(item: Pick<MediaItem, 'mediaType' | 'isAnimation'>): 'Movie' | 'TV' | 'Animation' {
  if (item.isAnimation) return 'Animation';
  return item.mediaType === 'tv' ? 'TV' : 'Movie';
}

import type { TMDBMovie } from './tmdb';
import { getPosterUrl, getGenreLabel } from './tmdb';
import { toSlug } from './slug';

/**
 * TMDB animation genre id. Titles tagged with this belong in the Animation
 * section (animated *films* come from TMDB; animated *series* from TVmaze).
 */
export const TMDB_ANIMATION_GENRE = 16;

/**
 * Map a raw TMDB movie into the shared `MediaItem` shape.
 *
 * Existing movie mapping yields `{ mediaType: 'movie', source: 'tmdb' }`.
 * Pass `isAnimation` (or let it auto-detect TMDB genre 16) so animated films
 * link under /animation instead of /movie.
 */
export function tmdbMovieToMediaItem(tmdb: TMDBMovie, isAnimation?: boolean): MediaItem {
  const year = tmdb.release_date ? parseInt(tmdb.release_date.split('-')[0], 10) : 0;
  const animation = isAnimation ?? (tmdb.genre_ids?.includes(TMDB_ANIMATION_GENRE) ?? false);
  return {
    id: tmdb.id,
    source: 'tmdb',
    mediaType: 'movie',
    title: tmdb.title,
    year,
    posterUrl: getPosterUrl(tmdb.poster_path, 'large'),
    rating: Math.round(tmdb.vote_average * 10) / 10,
    genre: getGenreLabel(tmdb.genre_ids),
    slug: toSlug(tmdb.title, year),
    isAnimation: animation,
  };
}
