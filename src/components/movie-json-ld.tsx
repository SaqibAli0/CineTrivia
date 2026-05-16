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

  // FAQ schema — Google shows these as expandable Q&A in search results
  const faqQuestions = [
    {
      question: `Where can I watch ${movie.title}?`,
      answer: `Visit the ${movie.title} page on CineTrivia to find current streaming platforms, rental options, and purchase links for ${movie.title} (${movie.year}).`,
    },
    {
      question: `What is ${movie.title} about?`,
      answer: movie.overview,
    },
    ...(movie.director ? [{
      question: `Who directed ${movie.title}?`,
      answer: `${movie.title} was directed by ${movie.director}${movie.year ? ` and released in ${movie.year}` : ''}.`,
    }] : []),
    ...(movie.runtime && movie.runtime > 0 ? [{
      question: `How long is ${movie.title}?`,
      answer: `${movie.title} has a runtime of ${Math.floor(movie.runtime / 60)} hours and ${movie.runtime % 60} minutes (${movie.runtime} minutes total).`,
    }] : []),
    ...(movie.cast.length > 0 ? [{
      question: `Who stars in ${movie.title}?`,
      answer: `The cast of ${movie.title} includes ${movie.cast.slice(0, 5).map(c => c.name).join(', ')}${movie.cast.length > 5 ? ' and more' : ''}.`,
    }] : []),
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqQuestions.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
