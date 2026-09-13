/**
 * TMDB gap-filler for TV shows + animated films.
 *
 * TVmaze is the primary TV source, but it has NO similar-titles, watch
 * providers, or trailers. TMDB does — for TV as well as movies. This module
 * bridges the two using the IMDB id that TVmaze exposes:
 *
 *   TVmaze show.externals.imdb  →  TMDB `/find/{imdb}`  →  TMDB tv id
 *   →  reuse /tv/{id}/similar, /tv/{id}/watch/providers, /tv/{id}/videos
 *
 * It also owns animated FILMS (TMDB `/discover/movie` genre 16) since TVmaze
 * is TV-only. Everything here is BEST-EFFORT: if TMDB is unreachable or there's
 * no IMDB match, callers still render the page with the gap-fill section
 * omitted (mirroring the movie page's allSettled enrichment).
 */

import { getPosterUrl, getGenreLabel, type TMDBMovie } from './tmdb';
import { tmdbFetch } from './tmdb-client';
import { toSlug } from './slug';
import { isPornographic } from './content-filter';
import { ServerCache, ONE_HOUR } from '@/ai/services/cache';
import { TMDB_ANIMATION_GENRE, tmdbMovieToMediaItem, type MediaItem } from './media';
import type { SimilarMovie, WatchProvider, MovieTrailer } from './tmdb-details';

/** IMDB id → TMDB tv id. Stable, so this never expires. Negative = "no match". */
const imdbToTvIdCache = new ServerCache<number>(500);

/** Thin wrapper over the shared, key-safe TMDB client. */
async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  return tmdbFetch<T>(endpoint, { params, revalidate: 3600 });
}

interface TMDBTvResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBFindResponse {
  tv_results: TMDBTvResult[];
  movie_results: TMDBMovie[];
}

/**
 * Resolve a TVmaze IMDB id to a TMDB tv id via `/find`. Returns null when there
 * is no TMDB match (cached as a negative so we don't re-probe every render).
 */
export async function findTvIdByImdb(imdbId: string | null | undefined): Promise<number | null> {
  if (!imdbId) return null;

  const cached = imdbToTvIdCache.get(imdbId);
  if (cached != null) return cached < 0 ? null : cached;

  try {
    const data = await fetchTMDB<TMDBFindResponse>(`/find/${imdbId}`, {
      external_source: 'imdb_id',
    });
    const tvId = data.tv_results?.[0]?.id ?? null;
    imdbToTvIdCache.set(imdbId, tvId ?? -1); // never expires — id↔imdb is stable
    return tvId;
  } catch (error) {
    // Network/HTTP error — don't cache; a later render may succeed.
    console.warn('[tmdb-tv] find-by-imdb failed:', error instanceof Error ? error.name : 'error');
    return null;
  }
}

/**
 * Fetch a wide backdrop image for a TMDB tv id — the same kind of cinematic
 * banner the movie page uses (TVmaze only provides a portrait poster, so this
 * is what makes the TV hero look identical to the movie hero).
 */
export async function getTvBackdrop(tvId: number): Promise<string | null> {
  try {
    const data = await fetchTMDB<{ backdrop_path: string | null }>(`/tv/${tvId}`);
    return data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null;
  } catch (error) {
    console.warn('[tmdb-tv] backdrop unavailable:', error instanceof Error ? error.name : 'error');
    return null;
  }
}

/** Similar TV shows for a TMDB tv id (parity with getSimilarMovies). */
export async function getSimilarTvShows(tvId: number, count = 8): Promise<SimilarMovie[]> {
  try {
    const [similar, recommended] = await Promise.all([
      fetchTMDB<{ results: TMDBTvResult[] }>(`/tv/${tvId}/similar`),
      fetchTMDB<{ results: TMDBTvResult[] }>(`/tv/${tvId}/recommendations`),
    ]);

    const seen = new Set<number>();
    const shows: SimilarMovie[] = [];

    for (const tv of [...recommended.results, ...similar.results]) {
      if (seen.has(tv.id) || !tv.poster_path) continue;
      if (isPornographic({ title: tv.name, overview: tv.overview })) continue;
      seen.add(tv.id);

      const year = tv.first_air_date ? parseInt(tv.first_air_date.split('-')[0], 10) : 0;
      if (!year) continue;

      shows.push({
        id: tv.id,
        title: tv.name,
        year,
        posterUrl: getPosterUrl(tv.poster_path, 'medium'),
        rating: Math.round(tv.vote_average * 10) / 10,
        genre: getGenreLabel(tv.genre_ids),
        slug: toSlug(tv.name, year),
      });

      if (shows.length >= count) break;
    }

    return shows;
  } catch (error) {
    console.warn('[tmdb-tv] similar shows unavailable:', error instanceof Error ? error.name : 'error');
    return [];
  }
}

interface TMDBWatchProviderResult {
  results: Record<string, {
    link?: string;
    flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
    rent?: { provider_id: number; provider_name: string; logo_path: string }[];
    buy?: { provider_id: number; provider_name: string; logo_path: string }[];
  }>;
}

/** Watch providers for a TMDB tv id (parity with getWatchProviders). */
export async function getTvWatchProviders(tvId: number, region = 'US'): Promise<WatchProvider[]> {
  try {
    const data = await fetchTMDB<TMDBWatchProviderResult>(`/tv/${tvId}/watch/providers`);
    const countryData = data.results[region];
    if (!countryData) return [];

    const seen = new Set<number>();
    const providers: WatchProvider[] = [];
    for (const p of [
      ...(countryData.flatrate || []),
      ...(countryData.rent || []),
      ...(countryData.buy || []),
    ]) {
      if (seen.has(p.provider_id)) continue;
      seen.add(p.provider_id);
      providers.push({
        id: p.provider_id,
        name: p.provider_name,
        logoUrl: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
      });
    }
    return providers.slice(0, 8);
  } catch (error) {
    console.warn('[tmdb-tv] watch providers unavailable:', error instanceof Error ? error.name : 'error');
    return [];
  }
}

/** Official trailer for a TMDB tv id (parity with getMovieTrailer). */
export async function getTvTrailer(tvId: number): Promise<MovieTrailer | null> {
  try {
    const data = await fetchTMDB<{
      results: { name: string; key: string; site: string; type: string; official: boolean; published_at: string }[];
    }>(`/tv/${tvId}/videos`);

    const youtubeVideos = data.results.filter((v) => v.site === 'YouTube');
    if (youtubeVideos.length === 0) return null;

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
    console.warn('[tmdb-tv] trailer unavailable:', error instanceof Error ? error.name : 'error');
    return null;
  }
}

/** Bundle of best-effort TMDB gap-fill data for a TV show. */
export interface TvGapFill {
  similar: SimilarMovie[];
  providers: WatchProvider[];
  trailer: MovieTrailer | null;
  /** Wide cinematic backdrop from TMDB (TVmaze has none). Null if unavailable. */
  backdropUrl: string | null;
}

/**
 * Given a TVmaze show's IMDB id, resolve the TMDB tv id and fetch a backdrop,
 * similar shows, watch providers, and a trailer — all best-effort. Never
 * throws: any failure yields an empty section so the TV page still renders.
 */
export async function getTvGapFill(imdbId: string | null | undefined): Promise<TvGapFill> {
  const empty: TvGapFill = { similar: [], providers: [], trailer: null, backdropUrl: null };
  const tvId = await findTvIdByImdb(imdbId);
  if (!tvId) return empty;

  const [similarR, providersR, trailerR, backdropR] = await Promise.allSettled([
    getSimilarTvShows(tvId, 8),
    getTvWatchProviders(tvId),
    getTvTrailer(tvId),
    getTvBackdrop(tvId),
  ]);

  return {
    similar: similarR.status === 'fulfilled' ? similarR.value : [],
    providers: providersR.status === 'fulfilled' ? providersR.value : [],
    trailer: trailerR.status === 'fulfilled' ? trailerR.value : null,
    backdropUrl: backdropR.status === 'fulfilled' ? backdropR.value : null,
  };
}

// ─── Animated films (TMDB genre 16) ───────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Discover animated FILMS via TMDB genre 16. These fill the film half of the
 * Animation section (animated series come from TVmaze). Content-filtered and
 * poster-gated, mapped to the shared MediaItem shape with `isAnimation: true`.
 */
export async function getAnimatedFilmsCollection(count = 20, page?: number): Promise<MediaItem[]> {
  try {
    const p = page ?? randomInt(1, 8);
    const data = await fetchTMDB<{ results: TMDBMovie[] }>('/discover/movie', {
      with_genres: String(TMDB_ANIMATION_GENRE),
      sort_by: 'vote_average.desc',
      'vote_count.gte': '200',
      page: String(p),
    });

    const seen = new Set<number>();
    const items: MediaItem[] = [];
    for (const movie of data.results) {
      if (seen.has(movie.id) || !movie.poster_path) continue;
      if (isPornographic(movie)) continue;
      const year = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;
      if (!year) continue;
      seen.add(movie.id);
      items.push(tmdbMovieToMediaItem(movie, true));
      if (items.length >= count) break;
    }
    return items;
  } catch (error) {
    console.warn('[tmdb-tv] animated films unavailable:', error instanceof Error ? error.name : 'error');
    return [];
  }
}

/**
 * Popular animated-film list for sitemap / static params. Fixed (unshuffled).
 */
export async function getPopularAnimatedFilmsList(
  pages = 3
): Promise<{ title: string; year: number; slug: string }[]> {
  const out: { title: string; year: number; slug: string }[] = [];
  try {
    const fetches = Array.from({ length: pages }, (_, i) =>
      fetchTMDB<{ results: TMDBMovie[] }>('/discover/movie', {
        with_genres: String(TMDB_ANIMATION_GENRE),
        sort_by: 'vote_average.desc',
        'vote_count.gte': '300',
        page: String(i + 1),
      })
    );
    const results = await Promise.all(fetches);
    for (const pageData of results) {
      for (const movie of pageData.results) {
        const year = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;
        if (!year || !movie.poster_path) continue;
        if (isPornographic(movie)) continue;
        out.push({ title: movie.title, year, slug: toSlug(movie.title, year) });
      }
    }
  } catch (error) {
    console.warn('[sitemap] animated films unavailable:', error instanceof Error ? error.name : 'error');
  }
  return out;
}
