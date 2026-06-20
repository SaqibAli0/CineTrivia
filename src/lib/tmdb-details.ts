/**
 * TMDB Detail & Similar Movies API
 *
 * Extended TMDB functions for individual movie pages.
 * Fetches full movie details and similar/recommended movies.
 */

import { TMDBMovie, getPosterUrl, getGenreLabel } from './tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string }[];
  spoken_languages: { english_name: string; iso_639_1: string }[];
}

interface TMDBCredits {
  crew: { job: string; name: string }[];
  cast: { name: string; character: string; order: number; profile_path: string | null }[];
}

export interface CastMember {
  name: string;
  character: string;
  profileUrl: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  year: number;
  rating: number;
  voteCount: number;
  genres: string[];
  genreLabel: string;
  runtime: number | null;
  tagline: string;
  director: string;
  cast: CastMember[];
  productionCompanies: string[];
  language: string;
  budget: number;
  revenue: number;
  contentRating: string | null;
}

export interface MovieTrailer {
  name: string;
  key: string;
  site: string;
  embedUrl: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface SimilarMovie {
  id: number;
  title: string;
  year: number;
  posterUrl: string;
  rating: number;
  genre: string;
  slug: string;
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error('TMDB_API_KEY is not configured');
  return key;
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', getApiKey());
  url.searchParams.set('language', 'en-US');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  // Retry up to 3 times on rate limit (429)
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

    if (response.status === 429) {
      // Wait before retrying — exponential backoff
      const waitMs = (attempt + 1) * 1500;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    if (!response.ok) {
      throw new Error(`TMDB request failed: ${response.status}`);
    }

    return response.json();
  }

  throw new Error(`TMDB request failed: 429 (rate limited after retries)`);
}

/**
 * Search for a movie by title and year, return its TMDB ID.
 */
export async function findMovieId(title: string, year: number): Promise<number | null> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>('/search/movie', {
    query: title,
    year: String(year),
  });

  if (data.results.length === 0) {
    // Try without year as fallback
    const fallback = await fetchTMDB<{ results: TMDBMovie[] }>('/search/movie', {
      query: title,
    });
    return fallback.results[0]?.id ?? null;
  }

  return data.results[0].id;
}

/**
 * Get full movie details by TMDB ID.
 */
export async function getMovieDetails(movieId: number): Promise<MovieDetails | null> {
  try {
    const [details, credits, releaseDates] = await Promise.all([
      fetchTMDB<TMDBMovieDetails>(`/movie/${movieId}`),
      fetchTMDB<TMDBCredits>(`/movie/${movieId}/credits`),
      fetchTMDB<{ results: { iso_3166_1: string; release_dates: { certification: string; type: number }[] }[] }>(
        `/movie/${movieId}/release_dates`
      ),
    ]);

    const year = details.release_date ? parseInt(details.release_date.split('-')[0], 10) : 0;
    const director = credits.crew.find((c) => c.job === 'Director')?.name ?? 'Unknown';
    const cast: CastMember[] = credits.cast.slice(0, 12).map((c) => ({
      name: c.name,
      character: c.character,
      profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '',
    }));
    const genres = details.genres.map((g) => g.name);

    // Extract US content rating (e.g., "PG-13", "R")
    let contentRating: string | null = null;
    const usRelease = releaseDates.results.find((r) => r.iso_3166_1 === 'US');
    if (usRelease) {
      // Prefer theatrical release (type 3), then any non-empty certification
      const theatrical = usRelease.release_dates.find((rd) => rd.type === 3 && rd.certification);
      const anyRated = usRelease.release_dates.find((rd) => rd.certification);
      contentRating = theatrical?.certification || anyRated?.certification || null;
    }

    return {
      id: details.id,
      title: details.title,
      overview: details.overview,
      posterUrl: getPosterUrl(details.poster_path, 'large'),
      backdropUrl: details.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
        : '',
      year,
      rating: Math.round(details.vote_average * 10) / 10,
      voteCount: details.vote_count,
      genres,
      genreLabel: genres.slice(0, 2).join(' / ') || 'Drama',
      runtime: details.runtime,
      tagline: details.tagline || '',
      director,
      cast,
      productionCompanies: details.production_companies.slice(0, 3).map((c) => c.name),
      language: details.spoken_languages[0]?.english_name ?? 'English',
      budget: details.budget || 0,
      revenue: details.revenue || 0,
      contentRating,
    };
  } catch (error) {
    console.error('Failed to fetch movie details:', error);
    return null;
  }
}

/**
 * Get the official YouTube trailer for a movie.
 * Returns the best trailer found (Official Trailer > any Trailer > any Teaser).
 */
export async function getMovieTrailer(movieId: number): Promise<MovieTrailer | null> {
  try {
    const data = await fetchTMDB<{
      results: { name: string; key: string; site: string; type: string; official: boolean; published_at: string }[];
    }>(`/movie/${movieId}/videos`);

    // Filter to YouTube videos only
    const youtubeVideos = data.results.filter((v) => v.site === 'YouTube');
    if (youtubeVideos.length === 0) return null;

    // Priority: official trailer > any trailer > teaser
    const officialTrailer = youtubeVideos.find((v) => v.type === 'Trailer' && v.official);
    const anyTrailer = youtubeVideos.find((v) => v.type === 'Trailer');
    const teaser = youtubeVideos.find((v) => v.type === 'Teaser');
    const video = officialTrailer || anyTrailer || teaser || youtubeVideos[0];

    return {
      name: video.name,
      key: video.key,
      site: video.site,
      embedUrl: `https://www.youtube.com/embed/${video.key}`,
      thumbnailUrl: `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`,
      publishedAt: video.published_at ? video.published_at.split('T')[0] : '',
    };
  } catch (error) {
    console.error('Failed to fetch movie trailer:', error);
    return null;
  }
}

/**
 * Get similar movies for a given TMDB movie ID.
 */
export async function getSimilarMovies(movieId: number, count: number = 8): Promise<SimilarMovie[]> {
  try {
    const [similar, recommended] = await Promise.all([
      fetchTMDB<{ results: TMDBMovie[] }>(`/movie/${movieId}/similar`),
      fetchTMDB<{ results: TMDBMovie[] }>(`/movie/${movieId}/recommendations`),
    ]);

    // Merge and deduplicate, preferring recommendations
    const seen = new Set<number>();
    const movies: SimilarMovie[] = [];

    for (const movie of [...recommended.results, ...similar.results]) {
      if (seen.has(movie.id) || !movie.poster_path) continue;
      seen.add(movie.id);

      const year = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;
      if (!year) continue;

      const titleSlug = movie.title
        .toLowerCase()
        .replace(/['']/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      movies.push({
        id: movie.id,
        title: movie.title,
        year,
        posterUrl: getPosterUrl(movie.poster_path, 'medium'),
        rating: Math.round(movie.vote_average * 10) / 10,
        genre: getGenreLabel(movie.genre_ids),
        slug: `${titleSlug}-${year}`,
      });

      if (movies.length >= count) break;
    }

    return movies;
  } catch (error) {
    console.error('Failed to fetch similar movies:', error);
    return [];
  }
}

/**
 * Get a list of popular movie IDs for sitemap generation.
 */
export async function getPopularMoviesList(pages: number = 5): Promise<{ title: string; year: number; slug: string }[]> {
  const movies: { title: string; year: number; slug: string }[] = [];

  try {
    const fetches = Array.from({ length: pages }, (_, i) =>
      fetchTMDB<{ results: TMDBMovie[] }>('/movie/popular', { page: String(i + 1) })
    );

    const results = await Promise.all(fetches);

    for (const page of results) {
      for (const movie of page.results) {
        const year = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;
        if (!year || !movie.poster_path) continue;

        const titleSlug = movie.title
          .toLowerCase()
          .replace(/['']/g, '')
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        movies.push({
          title: movie.title,
          year,
          slug: `${titleSlug}-${year}`,
        });
      }
    }
  } catch (error) {
    console.error('Failed to fetch popular movies for sitemap:', error);
  }

  return movies;
}

/**
 * Watch provider info from TMDB.
 */
export interface WatchProvider {
  id: number;
  name: string;
  logoUrl: string;
}

interface TMDBWatchProviderResult {
  results: Record<string, {
    link?: string;
    flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
    rent?: { provider_id: number; provider_name: string; logo_path: string }[];
    buy?: { provider_id: number; provider_name: string; logo_path: string }[];
  }>;
}

/**
 * Get streaming/rent/buy providers for a movie (US region by default).
 */
export async function getWatchProviders(movieId: number, region: string = 'US'): Promise<WatchProvider[]> {
  try {
    const data = await fetchTMDB<TMDBWatchProviderResult>(`/movie/${movieId}/watch/providers`);
    const countryData = data.results[region];
    if (!countryData) return [];

    const seen = new Set<number>();
    const providers: WatchProvider[] = [];

    // Combine flatrate (streaming), rent, and buy — prioritize streaming
    const allProviders = [
      ...(countryData.flatrate || []),
      ...(countryData.rent || []),
      ...(countryData.buy || []),
    ];

    for (const p of allProviders) {
      if (seen.has(p.provider_id)) continue;
      seen.add(p.provider_id);
      providers.push({
        id: p.provider_id,
        name: p.provider_name,
        logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
      });
    }

    return providers.slice(0, 8); // Max 8 providers
  } catch (error) {
    console.error('Failed to fetch watch providers:', error);
    return [];
  }
}
