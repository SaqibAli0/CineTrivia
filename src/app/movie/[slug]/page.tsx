import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Star, Film, Globe, Sparkles, Calendar, DollarSign, TrendingUp, ArrowRight, Clapperboard } from 'lucide-react';
import { fromSlug } from '@/lib/slug';
import { findMovieId, getMovieDetails, getSimilarMovies, getWatchProviders } from '@/lib/tmdb-details';
import { Button } from '@/components/ui/button';
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
  if (!parsed) return { title: 'Movie Not Found | CineTrivia' };
  const movieId = await findMovieId(parsed.title, parsed.year);
  if (!movieId) return { title: 'Movie Not Found | CineTrivia' };
  const movie = await getMovieDetails(movieId);
  if (!movie) return { title: 'Movie Not Found | CineTrivia' };
  const title = `${movie.title} (${movie.year}) — Movie Facts & Where to Watch | CineTrivia`;
  const description = `Discover fun facts about ${movie.title} (${movie.year}). ${movie.overview.slice(0, 120)}... Find where to watch, cast info, and similar movies.`;
  return {
    title,
    description,
    alternates: { canonical: `/movie/${slug}` },
    openGraph: { title, description, type: 'video.movie', images: movie.posterUrl ? [{ url: movie.posterUrl, width: 500, height: 750 }] : [], siteName: 'CineTrivia' },
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://classy-bublanina-aba3cc.netlify.app';

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
    <div className="bg-background min-h-screen text-foreground pt-16">
      <MovieJsonLd movie={movie} slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main>
          {/* Hero Banner */}
          <section className="relative -mx-4 sm:-mx-6 md:-mx-8 overflow-hidden">
            <div className="absolute inset-0">
              {movie.backdropUrl && (
                <Image src={movie.backdropUrl} alt="" fill className="object-cover" priority sizes="100vw" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-background/80 dark:bg-background/85" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
            </div>
            <div className="relative container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="shrink-0 mx-auto md:mx-0">
                  <div className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50">
                    {movie.posterUrl ? (
                      <Image src={movie.posterUrl} alt={`${movie.title} poster`} width={300} height={450} className="object-cover w-full h-full" priority />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Film className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight text-foreground mb-2">
                    {movie.title}
                    <span className="text-muted-foreground font-normal text-lg sm:text-xl md:text-2xl ml-2">({movie.year})</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-4">
                    {movie.runtime != null && movie.runtime > 0 && (<><span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span><span>•</span></>)}
                    <span>{movie.genres.join(', ')}</span>
                    <span>•</span>
                    <span>{movie.language}</span>
                  </div>
                  {movie.rating > 0 && (
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                      <span className="text-xl font-bold">{movie.rating}</span>
                      <span className="text-muted-foreground text-sm">/10</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{movie.voteCount.toLocaleString()} user ratings</span>
                  </div>
                  )}
                  {movie.tagline && (
                    <p className="italic text-muted-foreground mb-4 text-sm sm:text-base">&ldquo;{movie.tagline}&rdquo;</p>
                  )}
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">Overview</h3>
                    <p className="text-sm sm:text-[15px] leading-relaxed text-muted-foreground max-w-2xl line-clamp-4 md:line-clamp-none">{movie.overview}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5 text-sm">
                    <div><p className="text-muted-foreground text-xs">Director</p><p className="font-medium text-foreground">{movie.director}</p></div>
                    {movie.productionCompanies.length > 0 && (<div><p className="text-muted-foreground text-xs">Studio</p><p className="font-medium text-foreground">{movie.productionCompanies[0]}</p></div>)}
                    {movie.budget > 0 && (<div><p className="text-muted-foreground text-xs">Budget</p><p className="font-medium text-foreground">{formatMoney(movie.budget)}</p></div>)}
                    {movie.revenue > 0 && (<div><p className="text-muted-foreground text-xs">Revenue</p><p className="font-medium text-foreground">{formatMoney(movie.revenue)}</p></div>)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <FunFactButton movieTitle={movie.title} />
                    <SocialShare
                      title={`${movie.title} (${movie.year})`}
                      url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://classy-bublanina-aba3cc.netlify.app'}/movie/${slug}`}
                      description={movie.tagline || `Discover fun facts about ${movie.title}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Body sections */}
          <div className="space-y-12 sm:space-y-16 py-10 sm:py-14">
            <section>
              <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-6 flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-primary" />
                Cast
              </h2>
              <CastCarousel cast={movie.cast} />
            </section>

            <section>
              <WatchButtons movieTitle={movie.title} year={movie.year} providers={watchProviders} />
            </section>

            <section>
              <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-5 flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                Movie Facts
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                <FactCard label="Release Year" value={String(movie.year)} icon={<Calendar className="w-5 h-5" />} />
                {movie.runtime && movie.runtime > 0 ? <FactCard label="Runtime" value={`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`} icon={<Clock className="w-5 h-5" />} /> : null}
                <FactCard label="Language" value={movie.language} icon={<Globe className="w-5 h-5" />} />
                {movie.rating > 0 && <FactCard label="Rating" value={`${movie.rating} / 10`} icon={<Star className="w-5 h-5" />} />}
                {movie.budget > 0 && <FactCard label="Budget" value={formatMoney(movie.budget)} icon={<DollarSign className="w-5 h-5" />} />}
                {movie.revenue > 0 && <FactCard label="Box Office" value={formatMoney(movie.revenue)} icon={<TrendingUp className="w-5 h-5" />} />}
              </div>
              {movie.productionCompanies.length > 0 && (
                <div className="mt-5 p-4 rounded-xl bg-card border border-border">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Production Companies</p>
                  <p className="text-sm font-medium text-foreground">{movie.productionCompanies.join(' • ')}</p>
                </div>
              )}
            </section>

            {/* Ad placement — renders only when AdSense is configured */}
            <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_MOVIE_SLOT || ''} format="horizontal" className="my-4" />

            {similarMovies.length > 0 && (
              <section>
                <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  You Might Also Like
                </h2>
                <SimilarMoviesGrid movies={similarMovies} />
              </section>
            )}

            {/* FAQ Section — targets "where to watch [movie]", "who directed [movie]" queries */}
            <section>
              <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-5 flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                  <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                    Where can I watch {movie.title}?
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                    Check the &quot;Where to Watch&quot; section above for current streaming platforms, rental options, and purchase links for {movie.title} ({movie.year}).
                  </p>
                </details>
                <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                  <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                    What is {movie.title} about?
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                    {movie.overview}
                  </p>
                </details>
                {movie.director && (
                  <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                    <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                      Who directed {movie.title}?
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                      {movie.title} was directed by {movie.director} and released in {movie.year}. {movie.genres.length > 0 ? `It is a ${movie.genres.join(', ').toLowerCase()} film.` : ''}
                    </p>
                  </details>
                )}
                {movie.runtime && movie.runtime > 0 && (
                  <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                    <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                      How long is {movie.title}?
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                      {movie.title} has a runtime of {Math.floor(movie.runtime / 60)} hours and {movie.runtime % 60} minutes ({movie.runtime} minutes total).
                    </p>
                  </details>
                )}
                {movie.cast.length > 0 && (
                  <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                    <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                      Who stars in {movie.title}?
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                      The cast of {movie.title} includes {movie.cast.slice(0, 5).map(c => `${c.name} as ${c.character}`).join(', ')}{movie.cast.length > 5 ? ' and more' : ''}.
                    </p>
                  </details>
                )}
              </div>
            </section>

            <section className="text-center py-12 sm:py-16 rounded-2xl bg-card border border-border">
              <Film className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-headline text-xl sm:text-2xl text-foreground mb-2">Need a recommendation?</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">Tell us your mood and our AI picks the perfect movie for you.</p>
              <Link href="/"><Button size="lg" className="rounded-full px-8">Get AI Recommendation<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function FactCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 h-12 sm:h-14 md:h-16 px-3 sm:px-4 md:px-5 rounded-lg bg-card border border-border">
      <span className="text-primary shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
