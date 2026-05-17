import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ImageIcon } from 'lucide-react';
import { fromSlug } from '@/lib/slug';
import { findMovieId, getMovieDetails, getSimilarMovies, getWatchProviders } from '@/lib/tmdb-details';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FunFactButton } from '@/components/fun-fact-button';
import { SimilarMoviesGrid } from '@/components/similar-movies-grid';
import { WatchButtons } from '@/components/watch-buttons';
import { MovieJsonLd } from '@/components/movie-json-ld';
import { CastCarousel } from '@/components/cast-carousel';
import { SocialShare } from '@/components/social-share';
import { AdSenseSlot } from '@/components/adsense-slot';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = fromSlug(slug);
  if (!parsed) return { title: 'Movie Not Found' };
  const movieId = await findMovieId(parsed.title, parsed.year);
  if (!movieId) return { title: 'Movie Not Found' };
  const movie = await getMovieDetails(movieId);
  if (!movie) return { title: 'Movie Not Found' };
  const title = `${movie.title} (${movie.year}) — Movie Facts & Where to Watch`;
  const description = `Discover fun facts about ${movie.title} (${movie.year}). ${movie.overview.slice(0, 120)}... Find where to watch, cast info, and similar movies.`;
  return {
    title,
    description,
    alternates: { canonical: `/movie/${slug}` },
    openGraph: { title: `${title} | CineTrivia`, description, type: 'video.movie', images: movie.posterUrl ? [{ url: movie.posterUrl, width: 500, height: 750 }] : [], siteName: 'CineTrivia' },
    twitter: { card: 'summary_large_image', title: `${movie.title} (${movie.year}) | CineTrivia`, description, images: movie.posterUrl ? [movie.posterUrl] : [] },
  };
}

function formatMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default async function MoviePage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = fromSlug(slug);
  if (!parsed) notFound();
  const movieId = await findMovieId(parsed.title, parsed.year);
  if (!movieId) notFound();
  const [movie, similarMovies, watchProviders] = await Promise.all([
    getMovieDetails(movieId),
    getSimilarMovies(movieId, 8),
    getWatchProviders(movieId),
  ]);
  if (!movie) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const titleWords = movie.title.split(' ');
  const lastWord = titleWords.pop() || '';
  const mainTitle = titleWords.join(' ');

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      ...(movie.genres.length > 0
        ? [{ '@type': 'ListItem', position: 2, name: movie.genres[0], item: `${siteUrl}/genre/${movie.genres[0].toLowerCase().replace(/\s+/g, '-')}` }]
        : []),
      { '@type': 'ListItem', position: movie.genres.length > 0 ? 3 : 2, name: `${movie.title} (${movie.year})` },
    ],
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <MovieJsonLd movie={movie} slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 py-12 pt-36 flex flex-col gap-16">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-bordercolor pb-16">
          {/* Left — Poster */}
          <div className="lg:col-span-4 spec-card p-4 relative">
            <div className="visual-preview flex-1 bg-black/40 w-full relative min-h-0">
              <div className="crosshair-corner cc-tl" />
              <div className="crosshair-corner cc-tr" />
              <div className="crosshair-corner cc-bl" />
              <div className="crosshair-corner cc-br" />
              {movie.posterUrl ? (
                <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover image-filter" sizes="(max-width: 1024px) 100vw, 33vw" priority />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <ImageIcon className="w-16 h-16 text-parchment/20" />
                </div>
              )}
            </div>
          </div>

          {/* Right — Info */}
          <div className="lg:col-span-8 flex flex-col justify-center pt-4 lg:pt-0 lg:pl-8">
            <div className="mono-font text-terracotta mb-4 border-b border-bordercolor inline-block pb-2 w-fit">
              Movie Details
            </div>

            <h1 className="display-font text-5xl md:text-6xl lg:text-7xl text-parchment mb-6">
              {mainTitle && <>{mainTitle}<br /></>}
              <span className="text-terracotta">{lastWord}</span>
            </h1>

            {movie.tagline && (
              <p className="mono-font text-parchment/50 text-[11px] mb-6 italic">&ldquo;{movie.tagline}&rdquo;</p>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-y border-bordercolor py-6">
              <div>
                <div className="mono-font text-parchment/50 mb-1">Director</div>
                <div className="display-font text-xl text-parchment tracking-wide">{movie.director || '—'}</div>
              </div>
              <div>
                <div className="mono-font text-parchment/50 mb-1">Year</div>
                <div className="display-font text-xl text-parchment tracking-wide">{movie.year}</div>
              </div>
              <div>
                <div className="mono-font text-parchment/50 mb-1">Runtime</div>
                <div className="display-font text-xl text-parchment tracking-wide">{movie.runtime ? `${movie.runtime} min` : '—'}</div>
              </div>
              <div>
                <div className="mono-font text-parchment/50 mb-1">Rating</div>
                <div className="display-font text-xl text-terracotta tracking-wide rating-badge inline-block px-2 py-0.5">{movie.rating.toFixed(1)}</div>
              </div>
            </div>

            {/* Description */}
            <p className="mono-font text-parchment/80 leading-relaxed text-[11px] max-w-2xl text-justify">
              {movie.overview}
            </p>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {movie.genres.map((g) => (
                <Link key={g} href={`/genre/${g.toLowerCase().replace(/\s+/g, '-')}`} className="genre-pill mono-font px-3 py-1.5">
                  {g}
                </Link>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <FunFactButton movieTitle={movie.title} />
              <SocialShare
                title={`${movie.title} (${movie.year})`}
                url={`${siteUrl}/movie/${slug}`}
                description={movie.tagline || `Discover fun facts about ${movie.title}`}
              />
            </div>
          </div>
        </section>

        {/* Cast */}
        {movie.cast.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className="flex items-end justify-between border-b border-bordercolor pb-4">
              <div>
                <h2 className="display-font text-3xl text-parchment">Cast</h2>
                <div className="mono-font text-terracotta mt-1">{movie.cast.length} members</div>
              </div>
            </div>
            <CastCarousel cast={movie.cast} />
          </section>
        )}

        {/* Watch Providers */}
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-bordercolor pb-4">
            <div>
              <h2 className="display-font text-3xl text-parchment">Where to Watch</h2>
              <div className="mono-font text-terracotta mt-1">Streaming & rental options</div>
            </div>
          </div>
          <WatchButtons movieTitle={movie.title} year={movie.year} providers={watchProviders} />
        </section>

        {/* Technical Data */}
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-bordercolor pb-4">
            <div>
              <h2 className="display-font text-3xl text-parchment">Details</h2>
              <div className="mono-font text-terracotta mt-1">Movie information</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <FactCard label="Release Year" value={String(movie.year)} />
            {movie.runtime && movie.runtime > 0 && <FactCard label="Runtime" value={`${movie.runtime} min`} />}
            <FactCard label="Language" value={movie.language} />
            {movie.rating > 0 && <FactCard label="Rating" value={`${movie.rating} / 10`} />}
            {movie.budget > 0 && <FactCard label="Budget" value={formatMoney(movie.budget)} />}
            {movie.revenue > 0 && <FactCard label="Box Office" value={formatMoney(movie.revenue)} />}
          </div>
          {movie.productionCompanies.length > 0 && (
            <div className="spec-card p-4">
              <div className="mono-font text-parchment/50 mb-2">Production Companies</div>
              <div className="mono-font text-parchment text-[11px]">{movie.productionCompanies.join(' • ')}</div>
            </div>
          )}
        </section>

        <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_MOVIE_SLOT || ''} format="horizontal" className="my-4" />

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className="flex items-end justify-between border-b border-bordercolor pb-4">
              <div>
                <h2 className="display-font text-3xl text-parchment">Similar Movies</h2>
                <div className="mono-font text-terracotta mt-1">You might also like</div>
              </div>
            </div>
            <SimilarMoviesGrid movies={similarMovies} />
          </section>
        )}

        {/* CTA */}
        <section className="spec-card p-12 text-center">
          <div className="mono-font text-terracotta mb-4">Discover more</div>
          <h3 className="display-font text-3xl text-parchment mb-3">Need a recommendation?</h3>
          <p className="mono-font text-parchment/60 text-[11px] mb-8 max-w-md mx-auto">
            Tell us your mood and we&apos;ll find the perfect movie for you.
          </p>
          <Link href="/" className="border border-terracotta text-terracotta mono-font px-8 py-4 hover:bg-terracotta hover:text-charcoal transition-colors inline-flex items-center gap-2">
            Get a Recommendation →
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="spec-card p-4">
      <div className="mono-font text-parchment/50 mb-1">{label}</div>
      <div className="display-font text-xl text-parchment tracking-wide">{value}</div>
    </div>
  );
}
