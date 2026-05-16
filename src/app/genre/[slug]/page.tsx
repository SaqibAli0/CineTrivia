import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Film, ImageIcon } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GenreIcon } from '@/components/genre-icon';
import { GENRES, getGenreBySlug, getMoviesByGenre } from '@/lib/genres';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const genre = getGenreBySlug(slug);
  if (!genre) return { title: 'Genre Not Found | CineTrivia' };

  const title = `Best ${genre.name} Movies — Top Rated ${genre.name} Films | CineTrivia`;
  const description = `Discover the best ${genre.name.toLowerCase()} movies. Browse top-rated ${genre.name.toLowerCase()} films with ratings, fun facts, and where to watch.`;

  return {
    title,
    description,
    alternates: { canonical: `/genre/${slug}` },
    openGraph: { title, description, type: 'website', siteName: 'CineTrivia' },
  };
}

export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }));
}

export default async function GenrePage({ params }: PageProps) {
  const { slug } = await params;
  const genre = getGenreBySlug(slug);
  if (!genre) notFound();

  const movies = await getMoviesByGenre(genre.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://classy-bublanina-aba3cc.netlify.app';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Genres', item: `${siteUrl}/genre` },
      { '@type': 'ListItem', position: 3, name: `${genre.name} Movies` },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${genre.name} Movies`,
    numberOfItems: movies.length,
    itemListElement: movies.slice(0, 10).map((movie, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/movie/${movie.slug}`,
      name: movie.title,
    })),
  };

  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="py-8 sm:py-12">
          <Link
            href="/genre"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All Genres
          </Link>

          <div className="mb-8">
            <h1 className="font-headline text-3xl sm:text-4xl text-foreground mb-2 flex items-center gap-3">
              <GenreIcon slug={genre.slug} className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              {genre.name} Movies
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              {genre.description}
            </p>
          </div>

          {movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted border border-border group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-lg">
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={`${movie.title} poster`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    {movie.rating > 0 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-[11px] font-semibold">{movie.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {movie.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{movie.year}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground">Loading movies...</p>
              <p className="text-muted-foreground text-sm">Check back shortly.</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
