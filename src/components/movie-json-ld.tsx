import type { MovieDetails } from '@/lib/tmdb-details';

interface MovieJsonLdProps {
  movie: MovieDetails;
  slug: string;
}

/**
 * JSON-LD structured data for movie pages.
 * Helps Google show rich results (star ratings, poster, etc.)
 */
export function MovieJsonLd({ movie, slug }: MovieJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://classy-bublanina-aba3cc.netlify.app';

  const jsonLd = {
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: movie.rating,
      bestRating: 10,
      ratingCount: movie.voteCount,
    },
    url: `${siteUrl}/movie/${slug}`,
    productionCompany: movie.productionCompanies.map((name) => ({
      '@type': 'Organization',
      name,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
