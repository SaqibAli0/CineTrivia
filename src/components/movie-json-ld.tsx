import type { MovieDetails, MovieTrailer } from '@/lib/tmdb-details';
import { SITE_URL } from '@/lib/site';

interface MovieJsonLdProps {
  movie: MovieDetails;
  slug: string;
  trailer?: MovieTrailer | null;
}

/**
 * JSON-LD structured data for movie pages.
 * Outputs Movie schema (+ AggregateRating) and VideoObject for trailers.
 * FAQ schema removed — Google deprecated FAQ rich results on May 7, 2026.
 */
export function MovieJsonLd({ movie, slug, trailer }: MovieJsonLdProps) {
  const siteUrl = SITE_URL;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview,
    image: movie.posterUrl || undefined,
    datePublished: movie.year ? `${movie.year}-01-01` : undefined,
    director: movie.director
      ? {
          '@type': 'Person',
          name: movie.director,
        }
      : undefined,
    actor: movie.cast.map((member) => ({
      '@type': 'Person',
      name: member.name,
    })),
    genre: movie.genres,
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
    aggregateRating: movie.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: movie.rating,
      bestRating: 10,
      worstRating: 0,
      ratingCount: movie.voteCount,
    } : undefined,
    url: `${siteUrl}/movie/${slug}`,
    productionCompany: movie.productionCompanies.map((name) => ({
      '@type': 'Organization',
      name,
    })),
  };

  // Add contentRating if available (e.g., "PG-13", "R")
  if (movie.contentRating) {
    jsonLd.contentRating = movie.contentRating;
  }

  // VideoObject schema for trailers — earns video rich results in Google
  // Required: name, thumbnailUrl, uploadDate, and either contentUrl or embedUrl
  const videoSchema = trailer ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: trailer.name,
    description: `Official trailer for ${movie.title} (${movie.year})`,
    thumbnailUrl: trailer.thumbnailUrl,
    uploadDate: trailer.publishedAt,
    embedUrl: trailer.embedUrl,
    duration: undefined, // TMDB doesn't provide trailer duration
  } : null;

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
