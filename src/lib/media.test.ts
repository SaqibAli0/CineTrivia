import { describe, it, expect } from 'vitest';
import {
  basePath,
  mediaHref,
  mediaTypeLabel,
  tmdbMovieToMediaItem,
  type MediaItem,
} from './media';
import type { TMDBMovie } from './tmdb';

describe('basePath', () => {
  it('routes movies to /movie', () => {
    expect(basePath('movie')).toBe('/movie');
  });

  it('routes tv to /tv', () => {
    expect(basePath('tv')).toBe('/tv');
  });

  it('routes animation to /animation regardless of media type', () => {
    expect(basePath('movie', true)).toBe('/animation');
    expect(basePath('tv', true)).toBe('/animation');
  });
});

describe('mediaHref', () => {
  it('builds the full detail href', () => {
    expect(mediaHref({ mediaType: 'tv', slug: 'stranger-things-2016' })).toBe(
      '/tv/stranger-things-2016'
    );
    expect(
      mediaHref({ mediaType: 'movie', isAnimation: true, slug: 'spirited-away-2001' })
    ).toBe('/animation/spirited-away-2001');
  });
});

describe('mediaTypeLabel', () => {
  it('labels by type/animation', () => {
    expect(mediaTypeLabel({ mediaType: 'movie' })).toBe('Movie');
    expect(mediaTypeLabel({ mediaType: 'tv' })).toBe('TV');
    expect(mediaTypeLabel({ mediaType: 'tv', isAnimation: true })).toBe('Animation');
  });
});

describe('tmdbMovieToMediaItem', () => {
  const base: TMDBMovie = {
    id: 27205,
    title: 'Inception',
    overview: 'A thief who steals corporate secrets...',
    poster_path: '/poster.jpg',
    backdrop_path: null,
    release_date: '2010-07-16',
    vote_average: 8.37,
    genre_ids: [28, 878],
  };

  it('maps a TMDB movie to a movie/tmdb MediaItem', () => {
    const item = tmdbMovieToMediaItem(base);
    expect(item.mediaType).toBe('movie');
    expect(item.source).toBe('tmdb');
    expect(item.year).toBe(2010);
    expect(item.rating).toBe(8.4);
    expect(item.slug).toBe('inception-2010');
    expect(item.isAnimation).toBe(false);
  });

  it('auto-detects animation via TMDB genre 16', () => {
    const animated: TMDBMovie = { ...base, title: 'Spirited Away', genre_ids: [16, 14], release_date: '2001-07-20' };
    const item = tmdbMovieToMediaItem(animated);
    expect(item.isAnimation).toBe(true);
    expect(mediaHref(item)).toBe('/animation/spirited-away-2001');
  });
});
