/**
 * Central media classification + labeling for anime-aware SEO.
 *
 * One source of truth for two related questions:
 *   1. "Is this title anime?" — a broad, heuristic rule (see `isAnime`).
 *   2. "What nouns/keywords should a page use?" — see `mediaLabel`.
 *
 * Kept pure (no I/O, no framework imports) so it's cheap to unit-test and can
 * be called from server components, metadata builders, and JSON-LD alike.
 */

/**
 * Well-known anime studios / networks. Matching is case-insensitive and
 * substring-based (e.g. "Studio Ghibli" matches a production company string of
 * "Studio Ghibli, Inc."). Kept intentionally centralized so the list is easy to
 * tune as edge cases surface.
 */
export const ANIME_STUDIOS: readonly string[] = [
  'studio ghibli',
  'ghibli',
  'toei animation',
  'toei',
  'madhouse',
  'bones',
  'ufotable',
  'kyoto animation',
  'mappa',
  'sunrise',
  'pierrot',
  'wit studio',
  'a-1 pictures',
  'a1 pictures',
  'shaft',
  'trigger',
  'comix wave',
  'comix wave films',
  'production i.g',
  'production ig',
  'gainax',
  'gonzo',
  'j.c.staff',
  'jc staff',
  'david production',
  'cloverworks',
  'science saru',
];

/** Genre tags that read as explicitly "anime" (case-insensitive). */
const ANIME_GENRE_TAGS = ['anime'];

/** Japanese original-language signals across our two data sources. */
const JAPANESE_LANGUAGE_VALUES = ['ja', 'jpn', 'japanese'];

/** Inputs for the broad anime heuristic. All fields are optional/defensive. */
export interface AnimeSignals {
  /** True when the title is already known to be animation (genre 16 / TVmaze tag). */
  isAnimation?: boolean;
  /** Original/spoken language: TMDB english_name ("Japanese") or ISO code ("ja"). */
  language?: string | null;
  /** Genre tags/names (TVmaze free-text tags or TMDB genre names). */
  genres?: readonly string[] | null;
  /** A single studio/network string, when the caller has just one. */
  studio?: string | null;
  /** Studio/network strings (TMDB production companies, TVmaze network). */
  studios?: readonly string[] | null;
}

function includesJapanese(language: string | null | undefined): boolean {
  if (!language) return false;
  const l = language.toLowerCase().trim();
  return JAPANESE_LANGUAGE_VALUES.some((v) => l === v || l.includes('japanese'));
}

function matchesAnimeStudio(name: string | null | undefined): boolean {
  if (!name) return false;
  const n = name.toLowerCase();
  return ANIME_STUDIOS.some((studio) => n.includes(studio));
}

/**
 * Broad, heuristic "is this anime?" test.
 *
 * Rule: the title must be animated AND satisfy at least one anime signal:
 *   - an explicit "anime" genre tag, OR
 *   - Japanese original language, OR
 *   - a studio/network on the known-anime list.
 *
 * Non-animated titles (live action) are never anime. Western animation
 * (e.g. Pixar, English, no anime tag/studio) is animation but not anime.
 */
export function isAnime(signals: AnimeSignals): boolean {
  const { isAnimation, language, genres, studio, studios } = signals;

  // Anime is a subset of animation. If we know it isn't animation, stop.
  if (isAnimation === false) return false;

  const tags = (genres ?? []).map((g) => g.toLowerCase().trim());
  const hasAnimeTag = tags.some((t) => ANIME_GENRE_TAGS.includes(t));

  // When `isAnimation` wasn't supplied, infer animation-ness from the tags so
  // callers that only have genres still work (an "anime" tag implies animation).
  const looksAnimated =
    isAnimation === true ||
    hasAnimeTag ||
    tags.includes('animation') ||
    tags.includes('cartoon');
  if (!looksAnimated) return false;

  if (hasAnimeTag) return true;
  if (includesJapanese(language)) return true;

  const studioList = [studio, ...(studios ?? [])];
  return studioList.some(matchesAnimeStudio);
}

/** Content kinds the label helper understands. */
export type MediaKind =
  | 'anime-series'
  | 'anime-film'
  | 'tv'
  | 'movie'
  | 'animated-film';

export interface MediaLabel {
  /** Short noun for prose/descriptions, e.g. "anime", "movie", "TV series". */
  noun: string;
  /** Noun used in section headings, e.g. "Anime", "Movie", "Show". */
  headingNoun: string;
  /** SEO keyword variants to weave into titles/descriptions. */
  keywords: string[];
}

/**
 * Map a content kind to the nouns + keyword variants a page should use. Keeps
 * on-page copy, metadata, and schema consistent for each type.
 */
export function mediaLabel(kind: MediaKind): MediaLabel {
  switch (kind) {
    case 'anime-series':
      return {
        noun: 'anime',
        headingNoun: 'Anime',
        keywords: [
          'anime',
          'watch anime online',
          'subbed and dubbed',
          'anime series',
          'episodes',
        ],
      };
    case 'anime-film':
      return {
        noun: 'anime',
        headingNoun: 'Anime',
        keywords: [
          'anime',
          'watch anime online',
          'subbed and dubbed',
          'anime film',
          'anime movie',
        ],
      };
    case 'tv':
      return {
        noun: 'TV series',
        headingNoun: 'Show',
        keywords: ['TV series', 'watch online', 'episodes', 'cast', 'where to stream'],
      };
    case 'movie':
      return {
        noun: 'movie',
        headingNoun: 'Movie',
        keywords: ['movie', 'watch online', 'cast', 'where to stream', 'similar movies'],
      };
    case 'animated-film':
      return {
        noun: 'animated film',
        headingNoun: 'Animation',
        keywords: [
          'animated film',
          'animation',
          'watch online',
          'cast',
          'where to stream',
        ],
      };
  }
}

/** Inputs for the shared metadata copy builder. */
export interface MetaCopyInput {
  kind: MediaKind;
  title: string;
  year: number;
  /** Short synopsis; trimmed and appended to the description. */
  overview?: string;
}

export interface MetaCopy {
  /** `<title>` text (without the "| CineTrivia" suffix). */
  title: string;
  /** Meta description weaving in type-appropriate keyword variants. */
  description: string;
}

/**
 * Build a type-adaptive `<title>` + description for a detail page. Anime titles
 * read "Anime Facts, Episodes & Where to Watch"; TV/movie/animation use their
 * own nouns. Keeps metadata consistent across movie/tv/animation routes and is
 * pure so it can be unit-tested.
 */
export function buildMetaCopy({ kind, title, year, overview }: MetaCopyInput): MetaCopy {
  const label = mediaLabel(kind);
  const synopsis = overview ? `${overview.slice(0, 120).trim()}...` : '';

  // Title suffix per kind.
  let suffix: string;
  switch (kind) {
    case 'anime-series':
      suffix = 'Anime Facts, Episodes & Where to Watch';
      break;
    case 'anime-film':
      suffix = 'Anime Facts & Where to Watch';
      break;
    case 'tv':
      suffix = 'TV Series Facts, Episodes & Where to Watch';
      break;
    case 'animated-film':
      suffix = 'Animation Facts & Where to Watch';
      break;
    case 'movie':
    default:
      suffix = 'Movie Facts & Where to Watch';
      break;
  }

  const metaTitle = `${title} (${year}) — ${suffix}`;

  // Description: a natural sentence that surfaces the primary keyword variants.
  const isAnimeKind = kind === 'anime-series' || kind === 'anime-film';
  const lead = isAnimeKind
    ? `Watch ${title} anime (${year}): ${synopsis} Get facts, cast, episodes, and where to stream ${title} online — subbed and dubbed.`
    : `Discover ${title} (${year}), a ${label.noun}. ${synopsis} Find where to watch, cast info, facts, and similar ${label.noun === 'movie' ? 'movies' : 'titles'}.`;

  return { title: metaTitle, description: lead.replace(/\s+/g, ' ').trim() };
}
