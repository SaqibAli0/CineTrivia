import type { TvShowDetails } from '@/lib/tvmaze';
import type { MovieTrailer } from '@/lib/tmdb-details';
import { SITE_URL } from '@/lib/site';

interface TvSeriesJsonLdProps {
  show: TvShowDetails;
  /** Full detail path, e.g. "/tv/stranger-things-2016" or "/animation/...". */
  path: string;
  trailer?: MovieTrailer | null;
}

/**
 * Build the TVSeries JSON-LD object. Pure (no JSX) so it can be unit-tested.
 */
export function buildTvSeriesSchema(show: TvShowDetails, path: string): Record<string, unknown> {
  const siteUrl = SITE_URL;

  // For anime, ensure "Anime" is present in the genre list (de-duped,
  // case-insensitive) and expose an "{title} (anime)" alias so entity/alias
  // queries match. Non-anime series are unchanged.
  const hasAnimeGenre = show.genres.some((g) => g.toLowerCase() === 'anime');
  const genre = show.isAnime && !hasAnimeGenre ? [...show.genres, 'Anime'] : show.genres;
  const alternateName = show.isAnime ? `${show.title} (anime)` : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: show.title,
    alternateName,
    description: show.overview,
    image: show.posterUrl || undefined,
    datePublished: show.year ? `${show.year}-01-01` : undefined,
    numberOfSeasons: show.seasons || undefined,
    numberOfEpisodes: show.totalEpisodes || undefined,
    actor: show.cast.map((member) => ({
      '@type': 'Person',
      name: member.name,
    })),
    genre,
    aggregateRating:
      show.rating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: show.rating,
            bestRating: 10,
            worstRating: 0,
            ratingCount: 1,
          }
        : undefined,
    url: `${siteUrl}${path}`,
    productionCompany: show.network
      ? { '@type': 'Organization', name: show.network }
      : undefined,
  };
}

/**
 * JSON-LD structured data for TV / animated-series pages. Emits a `TVSeries`
 * schema (+ AggregateRating) and a VideoObject when a trailer exists — the TV
 * parallel of MovieJsonLd's `Movie` schema.
 */
export function TvSeriesJsonLd({ show, path, trailer }: TvSeriesJsonLdProps) {
  const jsonLd = buildTvSeriesSchema(show, path);

  const videoSchema = trailer
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: trailer.name,
        description: `Trailer for ${show.title} (${show.year})`,
        thumbnailUrl: trailer.thumbnailUrl,
        uploadDate: trailer.publishedAt,
        embedUrl: trailer.embedUrl,
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}
    </>
  );
}
