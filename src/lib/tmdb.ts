/**
 * TMDB (The Movie Database) API Client
 *
 * Provides dynamic movie collections using TMDB's free API.
 * Supports popular, top-rated, and genre-based discovery with
 * randomized pagination for variety on each visit.
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Poster sizes available from TMDB CDN
export const POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original',
} as const;

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// TMDB genre ID mapping
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// Genre IDs grouped for discovery rotation
const GENRE_COMBOS = [
  [28, 878],       // Action + Sci-Fi
  [18, 53],        // Drama + Thriller
  [35, 10749],     // Comedy + Romance
  [14, 12],        // Fantasy + Adventure
  [80, 9648],      // Crime + Mystery
  [27, 53],        // Horror + Thriller
  [18, 36],        // Drama + History
  [28, 12],        // Action + Adventure
];

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY is not configured');
  }
  return key;
}

/**
 * Build a full poster URL from TMDB's poster_path
 */
export function getPosterUrl(posterPath: string | null, size: keyof typeof POSTER_SIZES = 'large'): string {
  if (!posterPath) {
    return '';
  }
  return `${TMDB_IMAGE_BASE}/${POSTER_SIZES[size]}${posterPath}`;
}

/**
 * Map TMDB genre IDs to readable genre string
 */
export function getGenreLabel(genreIds: number[]): string {
  const names = genreIds
    .slice(0, 2)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean);
  return names.join(' / ') || 'Drama';
}

/**
 * Pick a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Fetch movies from a TMDB endpoint
 */
async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}): Promise<TMDBResponse> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', getApiKey());
  url.searchParams.set('language', 'en-US');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get popular movies with a random page for variety
 */
export async function getPopularMovies(page?: number): Promise<TMDBMovie[]> {
  const p = page ?? randomInt(1, 15);
  const data = await fetchFromTMDB('/movie/popular', { page: String(p) });
  return data.results;
}

/**
 * Get top-rated movies with a random page
 */
export async function getTopRatedMovies(page?: number): Promise<TMDBMovie[]> {
  const p = page ?? randomInt(1, 15);
  const data = await fetchFromTMDB('/movie/top_rated', { page: String(p) });
  return data.results;
}

/**
 * Discover movies by genre combination
 */
export async function discoverMovies(genreIds?: number[], page?: number): Promise<TMDBMovie[]> {
  const genres = genreIds ?? GENRE_COMBOS[randomInt(0, GENRE_COMBOS.length - 1)];
  const p = page ?? randomInt(1, 10);

  const data = await fetchFromTMDB('/discover/movie', {
    page: String(p),
    with_genres: genres.join(','),
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
  });

  return data.results;
}

/**
 * Search TMDB for a movie by title.
 * Useful for finding poster URLs for AI-recommended movies.
 */
export async function searchMovie(title: string, year?: number): Promise<TMDBMovie | null> {
  const params: Record<string, string> = { query: title };
  if (year) {
    params.year = String(year);
  }

  const data = await fetchFromTMDB('/search/movie', params);

  if (data.results.length === 0) {
    return null;
  }

  return data.results[0];
}

/**
 * Build a mixed collection of movies for the homepage.
 * Combines popular, top-rated, and genre-based discovery
 * for a fresh set on every visit.
 */
export async function getMovieCollection(count: number = 20): Promise<TMDBMovie[]> {
  try {
    // Fetch from multiple sources in parallel
    const [popular, topRated, discovered] = await Promise.all([
      getPopularMovies(),
      getTopRatedMovies(),
      discoverMovies(),
    ]);

    // Mix: 50% popular, 25% top-rated, 25% discovered
    const popularSlice = popular.slice(0, Math.ceil(count * 0.5));
    const topRatedSlice = topRated.slice(0, Math.ceil(count * 0.25));
    const discoveredSlice = discovered.slice(0, Math.ceil(count * 0.25));

    // Combine and deduplicate by ID
    const seen = new Set<number>();
    const combined: TMDBMovie[] = [];

    for (const movie of [...popularSlice, ...topRatedSlice, ...discoveredSlice]) {
      if (!seen.has(movie.id) && movie.poster_path) {
        seen.add(movie.id);
        combined.push(movie);
      }
    }

    // Shuffle the final list
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.slice(0, count);
  } catch (error) {
    console.error('Failed to fetch movie collection from TMDB:', error);
    return [];
  }
}
