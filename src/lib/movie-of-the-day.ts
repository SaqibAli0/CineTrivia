/**
 * Movie of the Day picker.
 *
 * Uses TMDB's top-rated list (very stable) and a date-based index
 * so every user sees the same movie on the same day worldwide.
 */

import { getPosterUrl, getGenreLabel } from './tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface DailyMovie {
  title: string;
  year: number;
  posterUrl: string;
  rating: number;
  genre: string;
  overview: string;
  /** Date string (YYYY-MM-DD UTC) this movie is for */
  date: string;
}

/**
 * Get today's date string in UTC (YYYY-MM-DD).
 */
export function getTodayUTC(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Simple numeric hash from a date string to get a stable index.
 */
function dateToIndex(dateStr: string, max: number): number {
  // Use date components to create a deterministic number
  const [y, m, d] = dateStr.split('-').map(Number);
  const hash = y * 10000 + m * 100 + d;
  return hash % max;
}

/**
 * Fetch the movie of the day from TMDB's top-rated list.
 * Top-rated is a very stable list (changes rarely), ensuring consistency.
 * We fetch page based on the date so the same date always yields the same movie.
 */
export async function getMovieOfTheDay(): Promise<DailyMovie | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  const today = getTodayUTC();

  try {
    // Use the date to pick a page (1-10) and an index within that page (0-19)
    const [y, m, d] = today.split('-').map(Number);
    const dayOfYear = Math.floor(
      (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const page = (dayOfYear % 10) + 1; // Pages 1-10
    const indexInPage = (y * 100 + dayOfYear) % 20; // Index 0-19

    const url = new URL(`${TMDB_BASE_URL}/movie/top_rated`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', String(page));

    const response = await fetch(url.toString(), { next: { revalidate: 86400 } }); // Cache 24h
    if (!response.ok) return null;

    const data = await response.json();
    const results = data.results || [];
    if (results.length === 0) return null;

    const movie = results[indexInPage % results.length];
    const year = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;

    return {
      title: movie.title,
      year,
      posterUrl: getPosterUrl(movie.poster_path, 'large'),
      rating: Math.round(movie.vote_average * 10) / 10,
      genre: getGenreLabel(movie.genre_ids || []),
      overview: movie.overview || '',
      date: today,
    };
  } catch (error) {
    console.error('Failed to get movie of the day:', error);
    return null;
  }
}
