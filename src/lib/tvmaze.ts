/**
 * TVmaze data layer.
 *
 * TVmaze is the PRIMARY source for TV shows and animated series. This module
 * mirrors what `tmdb.ts` / `tmdb-details.ts` do for movies: search, browse
 * collections, and full detail (seasons + total episodes, cast, status,
 * network, first-air year), all normalized into the shared `MediaItem` /
 * `TvShowDetails` shapes.
 *
 * TVmaze quirks handled here:
 *  - `summary` is HTML → stripped to plain text.
 *  - `genres` is a free-text tag list → animation is detected by an
 *    "Anime"/"Animation"/"Cartoon" tag (TVmaze has no numeric genre ids).
 *  - No `adult` flag → the shared pattern-based `isPornographic` carries the
 *    weight on name + summary.
 *  - No discover-by-genre endpoint → collections are built from the paged show
 *    index / search, capped to stay cheap.
 */

import { isPornographic } from './content-filter';
import { toSlug } from './slug';
import { tvmazeFetch } from './tvmaze-client';
import { ServerCache, ONE_HOUR } from '@/ai/services/cache';
import type { MediaItem } from './media';

// ─── Raw TVmaze response shapes (only the fields we use) ──────────────────────

interface TvmazeImage {
  medium?: string;
  original?: string;
}

interface TvmazeNetwork {
  id: number;
  name: string;
  country?: { name: string; code: string } | null;
}

export interface TvmazeShow {
  id: number;
  url: string;
  name: string;
  type: string;
  language: string | null;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  premiered: string | null;
  ended: string | null;
  officialSite: string | null;
  rating: { average: number | null };
  weight?: number;
  network: TvmazeNetwork | null;
  webChannel: (TvmazeNetwork & { officialSite?: string | null }) | null;
  externals: { tvrage: number | null; thetvdb: number | null; imdb: string | null };
  image: TvmazeImage | null;
  summary: string | null;
}

/** `/search/shows` returns `{ score, show }[]`. */
interface TvmazeSearchResult {
  score: number;
  show: TvmazeShow;
}

interface TvmazeSeason {
  id: number;
  number: number;
  episodeOrder: number | null;
  premiereDate: string | null;
  endDate: string | null;
}

interface TvmazeCastEntry {
  person: { name: string; image: TvmazeImage | null };
  character: { name: string; image: TvmazeImage | null };
  voice: boolean;
}

// ─── Normalized detail shape (parallel to MovieDetails) ───────────────────────

export interface TvCastMember {
  /** Actor name. */
  name: string;
  /** Character played. */
  character: string;
  profileUrl: string;
  /** True for voice roles (common in animation). */
  voice: boolean;
}

export interface TvShowDetails {
  id: number;
  source: 'tvmaze';
  mediaType: 'tv';
  title: string;
  overview: string;
  posterUrl: string;
  /** First-air year (0 when unknown). */
  year: number;
  /** Last-air year (0 when still running / unknown). */
  endYear: number;
  rating: number;
  genres: string[];
  genreLabel: string;
  status: string;
  network: string;
  language: string;
  seasons: number;
  totalEpisodes: number;
  runtime: number | null;
  cast: TvCastMember[];
  /** IMDB id (e.g. "tt1553656") used to bridge to TMDB for gap-fill. */
  imdbId: string | null;
  /** Whether this show belongs in the Animation section. */
  isAnimation: boolean;
  /** Canonical TVmaze page (for attribution links). */
  tvmazeUrl: string;
}

// ─── Caches (zero-cost: in-memory, ephemeral) ─────────────────────────────────

const showDetailsCache = new ServerCache<TvShowDetails>(300);
const showLookupCache = new ServerCache<number>(500); // title+year → show id (stable)
const collectionCache = new ServerCache<MediaItem[]>(20);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genre tags that mark a show as animation (case-insensitive). */
const ANIMATION_TAGS = ['anime', 'animation', 'cartoon'];

/** True when a TVmaze show's genre tags mark it as animation/anime. */
export function isAnimationShow(show: Pick<TvmazeShow, 'genres' | 'type'>): boolean {
  const tags = (show.genres || []).map((g) => g.toLowerCase());
  if (tags.some((t) => ANIMATION_TAGS.includes(t))) return true;
  // TVmaze also uses a top-level `type` of "Animation" for some entries.
  return (show.type || '').toLowerCase() === 'animation';
}

/**
 * Strip HTML tags and decode a few common entities from a TVmaze summary.
 * Summaries are short HTML fragments (<p><b>…</b></p>), never full documents.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // drop tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function yearFrom(date: string | null | undefined): number {
  if (!date) return 0;
  const y = parseInt(date.split('-')[0], 10);
  return Number.isFinite(y) ? y : 0;
}

function posterFrom(image: TvmazeImage | null): string {
  return image?.original || image?.medium || '';
}

function genreLabelFrom(genres: string[]): string {
  return genres.slice(0, 2).join(' / ') || 'Drama';
}

/** True when a show is safe to surface (fails CLOSED on filter error). */
function isSafeShow(show: Pick<TvmazeShow, 'name' | 'summary'>): boolean {
  try {
    return !isPornographic({ title: show.name, overview: stripHtml(show.summary) });
  } catch {
    return false;
  }
}

/** Map a raw TVmaze show into the shared MediaItem shape. */
export function showToMediaItem(show: TvmazeShow): MediaItem {
  const year = yearFrom(show.premiered);
  return {
    id: show.id,
    source: 'tvmaze',
    mediaType: 'tv',
    title: show.name,
    year,
    posterUrl: posterFrom(show.image),
    rating: show.rating?.average ? Math.round(show.rating.average * 10) / 10 : 0,
    genre: genreLabelFrom(show.genres || []),
    slug: toSlug(show.name, year),
    isAnimation: isAnimationShow(show),
  };
}

// ─── Search ─────────────────────────────────────────────────────────────────

/**
 * Search TVmaze shows by free-text query. `/search/shows` is fuzzy and returns
 * full show objects (so no follow-up fetch is needed), each scored.
 *
 * @param animationOnly when true, keep only animated/anime-tagged shows.
 */
export async function searchShows(query: string, animationOnly = false): Promise<MediaItem[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const results = await tvmazeFetch<TvmazeSearchResult[]>('/search/shows', {
      params: { q },
      revalidate: 3600,
    });

    return results
      .map((r) => r.show)
      .filter((s) => s && s.name)
      .filter(isSafeShow)
      .filter((s) => (animationOnly ? isAnimationShow(s) : true))
      .map(showToMediaItem);
  } catch (error) {
    console.warn('[tvmaze] search failed:', error instanceof Error ? error.name : 'error');
    return [];
  }
}

/**
 * Find a TVmaze show id by title (and optional year), using `/singlesearch`.
 * Used by the /tv/[slug] detail page to resolve a slug back to a show.
 *
 * `/singlesearch/shows?q=` returns the single best-matching show (or 404).
 * When a year is provided we still trust singlesearch's top pick (it's already
 * relevance-ranked), but cache under the title+year key.
 */
export async function findShowByTitle(title: string, year?: number): Promise<TvmazeShow | null> {
  const cacheKey = `${title.toLowerCase().trim()}|${year ?? ''}`;
  const cachedId = showLookupCache.get(cacheKey);
  if (cachedId != null) {
    const cached = showDetailsCache.get(String(cachedId));
    if (cached) {
      // We only cache details, not raw shows; fall through to a fresh fetch by
      // id when we have the id but not the raw show. Simpler: re-fetch by id.
    }
    try {
      return await tvmazeFetch<TvmazeShow>(`/shows/${cachedId}`);
    } catch {
      return null;
    }
  }

  try {
    const show = await tvmazeFetch<TvmazeShow>('/singlesearch/shows', {
      params: { q: title },
    });
    if (show && show.id) {
      showLookupCache.set(cacheKey, show.id); // stable → never expires
      return show;
    }
    return null;
  } catch {
    // 404 (no match) or network — caller decides how to treat it.
    return null;
  }
}

/**
 * Verified show info returned to the AI recommendation flow — same shape as
 * tmdb.ts `VerifiedMovie` so the flow can treat both sources uniformly.
 */
export interface VerifiedShow {
  title: string;
  year: number;
  rating: number;
  genre: string;
  overview: string;
  posterUrl: string;
  isAnimation: boolean;
}

/**
 * Verify an AI-suggested TV/animation pick against TVmaze `/singlesearch`.
 * Returns the real record (to correct a hallucinated year/rating and enrich the
 * poster) or null when no confident match. Throws TVmazeUnreachableError so the
 * caller can tell "network down" apart from "no match" (mirrors verifyMovie).
 *
 * @param requireAnimation when true, only accept animated/anime matches.
 */
export async function verifyShow(
  title: string,
  year?: number,
  requireAnimation = false
): Promise<VerifiedShow | null> {
  const { TVmazeUnreachableError } = await import('./tvmaze-client');
  try {
    const show = await tvmazeFetch<TvmazeShow>('/singlesearch/shows', { params: { q: title } });
    if (!show || !show.id) return null;
    if (!isSafeShow(show)) return null;
    const animation = isAnimationShow(show);
    if (requireAnimation && !animation) return null;

    return {
      title: show.name,
      year: yearFrom(show.premiered),
      rating: show.rating?.average ? Math.round(show.rating.average * 10) / 10 : 0,
      genre: genreLabelFrom(show.genres || []),
      overview: stripHtml(show.summary),
      posterUrl: posterFrom(show.image),
      isAnimation: animation,
    };
  } catch (error) {
    // 404 → no match (null). Network → rethrow so caller trusts the AI pick.
    if (error instanceof TVmazeUnreachableError) throw error;
    return null;
  }
}

// ─── Details ──────────────────────────────────────────────────────────────────

/**
 * Full show details by TVmaze id: main info + seasons (count + total episodes)
 * + cast. Secondary fetches use allSettled so a missing cast/season list never
 * blanks the page.
 */
export async function getShowDetails(showId: number): Promise<TvShowDetails | null> {
  const cached = showDetailsCache.get(String(showId));
  if (cached) return cached;

  let show: TvmazeShow;
  try {
    show = await tvmazeFetch<TvmazeShow>(`/shows/${showId}`);
  } catch (error) {
    console.warn('[tvmaze] show details unavailable:', error instanceof Error ? error.name : 'error');
    return null;
  }

  // Content-safety gate on the primary record.
  if (!isSafeShow(show)) return null;

  const [seasonsR, castR] = await Promise.allSettled([
    tvmazeFetch<TvmazeSeason[]>(`/shows/${showId}/seasons`),
    tvmazeFetch<TvmazeCastEntry[]>(`/shows/${showId}/cast`),
  ]);

  const seasonList = seasonsR.status === 'fulfilled' ? seasonsR.value : [];
  const castList = castR.status === 'fulfilled' ? castR.value : [];

  // Total episodes = sum of each season's ordered episode count.
  const totalEpisodes = seasonList.reduce((sum, s) => sum + (s.episodeOrder || 0), 0);

  const cast: TvCastMember[] = castList.slice(0, 12).map((c) => ({
    name: c.person?.name ?? 'Unknown',
    character: c.character?.name ?? '',
    profileUrl: posterFrom(c.person?.image ?? null),
    voice: Boolean(c.voice),
  }));

  const year = yearFrom(show.premiered);
  const genres = show.genres || [];

  const result: TvShowDetails = {
    id: show.id,
    source: 'tvmaze',
    mediaType: 'tv',
    title: show.name,
    overview: stripHtml(show.summary) || 'No description available.',
    posterUrl: posterFrom(show.image),
    year,
    endYear: yearFrom(show.ended),
    rating: show.rating?.average ? Math.round(show.rating.average * 10) / 10 : 0,
    genres,
    genreLabel: genreLabelFrom(genres),
    status: show.status || 'Unknown',
    network: show.network?.name || show.webChannel?.name || 'Unknown',
    language: show.language || 'Unknown',
    seasons: seasonList.length,
    totalEpisodes,
    runtime: show.averageRuntime ?? show.runtime ?? null,
    cast,
    imdbId: show.externals?.imdb ?? null,
    isAnimation: isAnimationShow(show),
    tvmazeUrl: show.url,
  };

  showDetailsCache.set(String(showId), result, ONE_HOUR * 24);
  return result;
}

/**
 * Resolve a slug ({title, year}) to full show details in one call.
 * Returns null when no confident match (genuine miss). Throws only on a hard
 * TVmaze-unreachable network error inside getShowDetails (which returns null),
 * so callers treat null uniformly.
 */
export async function getShowDetailsBySlug(title: string, year?: number): Promise<TvShowDetails | null> {
  const show = await findShowByTitle(title, year);
  if (!show) return null;
  return getShowDetails(show.id);
}

// ─── Collections ──────────────────────────────────────────────────────────────

/**
 * TVmaze has no "popular" endpoint, but its paged show index (`/shows?page=N`)
 * is ordered by an internal `weight`/relevance on the early pages, which gives
 * a reasonable "well-known shows" set cheaply. We pull a small, capped set of
 * pages, content-filter, and (optionally) keep only animation.
 */
async function fetchShowIndexPages(pages: number): Promise<TvmazeShow[]> {
  const fetches = Array.from({ length: pages }, (_, i) =>
    tvmazeFetch<TvmazeShow[]>('/shows', { params: { page: String(i) }, revalidate: 3600 })
  );
  const settled = await Promise.allSettled(fetches);
  const shows: TvmazeShow[] = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') shows.push(...r.value);
  }
  return shows;
}

/** Shuffle in place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * A mixed TV collection for the /tv landing page. Built from the show index,
 * dropping animation (that has its own section), posterless, and unsafe shows.
 * Sorted by TVmaze rating so the strongest titles surface first, then shuffled
 * within the top band for variety.
 */
export async function getTvCollection(count = 20): Promise<MediaItem[]> {
  const cacheKey = `tv|${count}`;
  const cached = collectionCache.get(cacheKey);
  if (cached) return shuffle([...cached]).slice(0, count);

  try {
    const shows = await fetchShowIndexPages(3); // ~750 shows, capped
    const items = shows
      .filter((s) => s && s.name && posterFrom(s.image))
      .filter(isSafeShow)
      .filter((s) => !isAnimationShow(s))
      .filter((s) => (s.rating?.average ?? 0) > 0)
      .sort((a, b) => (b.rating!.average! - a.rating!.average!))
      .slice(0, Math.max(count * 3, 60))
      .map(showToMediaItem);

    // Dedupe by id.
    const seen = new Set<number>();
    const deduped = items.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));

    collectionCache.set(cacheKey, deduped, ONE_HOUR * 6);
    return shuffle([...deduped]).slice(0, count);
  } catch (error) {
    console.warn('[tvmaze] tv collection unavailable:', error instanceof Error ? error.name : 'error');
    return [];
  }
}

/**
 * Animation-series collection (anime included). Same index scan, but keeps
 * ONLY animation/anime-tagged shows. Animated FILMS come from TMDB (Task 4),
 * not here — TVmaze is TV-only.
 */
export async function getAnimationSeriesCollection(count = 20): Promise<MediaItem[]> {
  const cacheKey = `anim|${count}`;
  const cached = collectionCache.get(cacheKey);
  if (cached) return shuffle([...cached]).slice(0, count);

  try {
    // Animation is a smaller slice of the index, so scan more pages to fill it.
    const shows = await fetchShowIndexPages(6);
    const items = shows
      .filter((s) => s && s.name && posterFrom(s.image))
      .filter(isSafeShow)
      .filter(isAnimationShow)
      .filter((s) => (s.rating?.average ?? 0) > 0)
      .sort((a, b) => (b.rating!.average! - a.rating!.average!))
      .slice(0, Math.max(count * 3, 60))
      .map(showToMediaItem);

    const seen = new Set<number>();
    const deduped = items.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));

    collectionCache.set(cacheKey, deduped, ONE_HOUR * 6);
    return shuffle([...deduped]).slice(0, count);
  } catch (error) {
    console.warn('[tvmaze] animation collection unavailable:', error instanceof Error ? error.name : 'error');
    return [];
  }
}

/**
 * Popular show list for sitemap / generateStaticParams. Fixed slugs (no random
 * shuffle) so the sitemap is stable across builds.
 */
export async function getPopularShowsList(
  pages = 3,
  animationOnly = false
): Promise<{ title: string; year: number; slug: string }[]> {
  try {
    const shows = await fetchShowIndexPages(pages);
    return shows
      .filter((s) => s && s.name && posterFrom(s.image))
      .filter(isSafeShow)
      .filter((s) => (animationOnly ? isAnimationShow(s) : !isAnimationShow(s)))
      .filter((s) => (s.rating?.average ?? 0) >= 7) // stronger titles only
      .slice(0, 100)
      .map((s) => {
        const year = yearFrom(s.premiered);
        return { title: s.name, year, slug: toSlug(s.name, year) };
      })
      .filter((s) => s.year > 0);
  } catch (error) {
    console.warn('[tvmaze] popular shows unavailable:', error instanceof Error ? error.name : 'error');
    return [];
  }
}
