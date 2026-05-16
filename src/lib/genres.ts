/**
 * Genre definitions and TMDB discovery for genre-based browsing.
 * Each genre becomes its own page at /genre/[slug].
 */

import { getPosterUrl, getGenreLabel } from './tmdb';
import { toSlug } from './slug';

export interface GenreInfo {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  description: string;
}

export interface GenreMovie {
  id: number;
  title: string;
  year: number;
  posterUrl: string;
  rating: number;
  slug: string;
}

export const GENRES: GenreInfo[] = [
  { id: 28, name: 'Action', slug: 'action', emoji: '💥', description: 'High-octane thrills, explosive set pieces, and adrenaline-pumping adventures.' },
  { id: 12, name: 'Adventure', slug: 'adventure', emoji: '🗺️', description: 'Epic journeys, daring quests, and worlds waiting to be explored.' },
  { id: 16, name: 'Animation', slug: 'animation', emoji: '🎨', description: 'Animated masterpieces for all ages — from Pixar to Studio Ghibli.' },
  { id: 35, name: 'Comedy', slug: 'comedy', emoji: '😂', description: 'Laugh-out-loud comedies, witty satires, and feel-good fun.' },
  { id: 80, name: 'Crime', slug: 'crime', emoji: '🔍', description: 'Heists, investigations, and the dark side of human nature.' },
  { id: 99, name: 'Documentary', slug: 'documentary', emoji: '📹', description: 'True stories that inform, inspire, and challenge perspectives.' },
  { id: 18, name: 'Drama', slug: 'drama', emoji: '🎭', description: 'Powerful performances, emotional depth, and stories that stay with you.' },
  { id: 10751, name: 'Family', slug: 'family', emoji: '👨‍👩‍👧‍👦', description: 'Movies the whole family can enjoy together.' },
  { id: 14, name: 'Fantasy', slug: 'fantasy', emoji: '🧙', description: 'Magical worlds, mythical creatures, and epic battles between good and evil.' },
  { id: 36, name: 'History', slug: 'history', emoji: '📜', description: 'Stories from the past that shaped our world.' },
  { id: 27, name: 'Horror', slug: 'horror', emoji: '👻', description: 'Terrifying tales that will keep you up at night.' },
  { id: 10402, name: 'Music', slug: 'music', emoji: '🎵', description: 'Musical journeys, biopics, and rhythm-driven stories.' },
  { id: 9648, name: 'Mystery', slug: 'mystery', emoji: '🕵️', description: 'Puzzles, whodunits, and twists you never see coming.' },
  { id: 10749, name: 'Romance', slug: 'romance', emoji: '💕', description: 'Love stories that make your heart flutter.' },
  { id: 878, name: 'Sci-Fi', slug: 'sci-fi', emoji: '🚀', description: 'Futuristic visions, space exploration, and technology gone wrong.' },
  { id: 53, name: 'Thriller', slug: 'thriller', emoji: '😰', description: 'Edge-of-your-seat suspense and psychological tension.' },
  { id: 10752, name: 'War', slug: 'war', emoji: '⚔️', description: 'Stories of conflict, courage, and the human cost of war.' },
  { id: 37, name: 'Western', slug: 'western', emoji: '🤠', description: 'Outlaws, showdowns, and the untamed frontier.' },
];

/**
 * Get genre info by slug.
 */
export function getGenreBySlug(slug: string): GenreInfo | null {
  return GENRES.find((g) => g.slug === slug) ?? null;
}

/**
 * Fetch movies for a specific genre from TMDB.
 */
export async function getMoviesByGenre(genreId: number, count: number = 20): Promise<GenreMovie[]> {
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  try {
    const url = new URL(`${TMDB_BASE_URL}/discover/movie`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('sort_by', 'vote_average.desc');
    url.searchParams.set('vote_count.gte', '500');
    url.searchParams.set('with_genres', String(genreId));
    url.searchParams.set('page', '1');

    const response = await fetch(url.toString(), { next: { revalidate: 86400 } }); // Cache 24h
    if (!response.ok) return [];

    const data = await response.json();
    const movies: GenreMovie[] = [];

    for (const movie of data.results) {
      if (!movie.poster_path || !movie.release_date) continue;
      const year = parseInt(movie.release_date.split('-')[0], 10);
      if (!year) continue;

      movies.push({
        id: movie.id,
        title: movie.title,
        year,
        posterUrl: getPosterUrl(movie.poster_path, 'medium'),
        rating: Math.round(movie.vote_average * 10) / 10,
        slug: toSlug(movie.title, year),
      });

      if (movies.length >= count) break;
    }

    return movies;
  } catch (error) {
    console.error('Failed to fetch genre movies:', error);
    return [];
  }
}
