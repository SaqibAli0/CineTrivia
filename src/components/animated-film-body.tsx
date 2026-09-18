import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Star,
  Film,
  Globe,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clapperboard,
} from 'lucide-react';
import { SITE_URL } from '@/lib/site';
import { genreSlug } from '@/lib/genres';
import type { MovieDetails, SimilarMovie, WatchProvider, MovieTrailer } from '@/lib/tmdb-details';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FunFactButton } from '@/components/fun-fact-button';
import { SimilarMoviesGrid } from '@/components/similar-movies-grid';
import { WatchButtons } from '@/components/watch-buttons';
import { MovieJsonLd } from '@/components/movie-json-ld';
import { MediaRetryReset } from '@/components/media-retry-reset';
import { CastCarousel } from '@/components/cast-carousel';
import { SocialShare } from '@/components/social-share';
import { AdSenseSlot } from '@/components/adsense-slot';

interface AnimatedFilmBodyProps {
  movie: MovieDetails;
  similar: SimilarMovie[];
  providers: WatchProvider[];
  trailer: MovieTrailer | null;
  /** Full detail path, e.g. "/animation/spirited-away-2001". */
  path: string;
  /** True when the film is anime (drives anime-worded copy + schema). */
  isAnime?: boolean;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/**
 * Detail body for an animated FILM (TMDB-sourced) rendered under /animation.
 * Mirrors the movie page but links/canonicalizes under /animation and emits a
 * Movie JSON-LD (correct for a film, even in the Animation section).
 */
export function AnimatedFilmBody({ movie, similar, providers, trailer, path, isAnime = false }: AnimatedFilmBodyProps) {
  const siteUrl = SITE_URL;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Animation', item: `${siteUrl}/animation` },
      { '@type': 'ListItem', position: 3, name: `${movie.title} (${movie.year})` },
    ],
  };

  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <MediaRetryReset path={path} />
      <MovieJsonLd movie={movie} slug={path.replace(/^\/animation\//, '')} trailer={trailer} basePath="/animation" isAnime={isAnime} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main>
          <section className="relative -mx-4 sm:-mx-6 md:-mx-8 overflow-hidden">
            <div className="absolute inset-0">
              {movie.backdropUrl ? (
                <>
                  <Image src={movie.backdropUrl} alt="" fill className="object-cover" priority sizes="100vw" aria-hidden="true" />
                  <div className="absolute inset-0 bg-background/85 dark:bg-background/88" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/75" />
                </>
              ) : movie.posterUrl ? (
                <>
                  {/* No backdrop → blurred poster with a lighter overlay so it
                      still reads as a cinematic backdrop. */}
                  <Image src={movie.posterUrl} alt="" fill className="object-cover scale-125 blur-2xl opacity-60" priority sizes="100vw" aria-hidden="true" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/50" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
              )}
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
                  {movie.tagline && (<p className="italic text-muted-foreground mb-4 text-sm sm:text-base">&ldquo;{movie.tagline}&rdquo;</p>)}
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">Overview</h3>
                    <p className="text-sm sm:text-[15px] leading-relaxed text-muted-foreground max-w-2xl line-clamp-4 md:line-clamp-none">{movie.overview}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5 text-sm">
                    {movie.director && movie.director !== 'Unknown' && (
                      <div><p className="text-muted-foreground text-xs">Director</p><p className="font-medium text-foreground">{movie.director}</p></div>
                    )}
                    {movie.productionCompanies.length > 0 && (
                      <div><p className="text-muted-foreground text-xs">Studio</p><p className="font-medium text-foreground">{movie.productionCompanies[0]}</p></div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <FunFactButton movieTitle={movie.title} mediaType="animation" />
                    <SocialShare
                      title={`${movie.title} (${movie.year})`}
                      url={`${siteUrl}${path}`}
                      description={movie.tagline || `Discover fun facts about ${movie.title}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-12 sm:space-y-16 py-10 sm:py-14">
            {movie.cast.length > 0 && (
              <section>
                <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-6 flex items-center gap-2">
                  <Clapperboard className="w-5 h-5 text-primary" />
                  Cast
                </h2>
                <CastCarousel cast={movie.cast} />
              </section>
            )}

            <section>
              <WatchButtons movieTitle={movie.title} year={movie.year} providers={providers} />
            </section>

            <section>
              <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-5 flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                {isAnime ? 'Anime Facts' : 'Animation Facts'}
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
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{isAnime ? 'Studio' : 'Production Companies'}</p>
                  <p className="text-sm font-medium text-foreground">{movie.productionCompanies.join(' • ')}</p>
                </div>
              )}
            </section>

            <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_MOVIE_SLOT || ''} format="horizontal" className="my-4" />

            {similar.length > 0 && (
              <section>
                <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  You Might Also Like
                </h2>
                <SimilarMoviesGrid movies={similar} />
              </section>
            )}

            {/* FAQ — targets "is X an anime", "where to watch X anime" queries.
                The film body previously had no FAQ block. */}
            <section>
              <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-5 flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {isAnime && (
                  <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                    <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                      Is {movie.title} an anime?
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                      Yes. {movie.title} ({movie.year}) is an anime film{movie.productionCompanies.length > 0 ? `, produced by ${movie.productionCompanies.join(', ')}` : ''}.
                    </p>
                  </details>
                )}
                <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                  <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                    Where can I watch {movie.title}{isAnime ? ' anime' : ''}?
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                    Check the &quot;Where to Watch&quot; section above for current streaming platforms, rental, and purchase options for {movie.title} ({movie.year}){isAnime ? ' — subbed and dubbed where available' : ''}.
                  </p>
                </details>
                <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                  <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                    What is {movie.title} about?
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">{movie.overview}</p>
                </details>
                {movie.productionCompanies.length > 0 && (
                  <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                    <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                      Who {isAnime ? 'animated' : 'made'} {movie.title}?
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                      {movie.title} was {isAnime ? 'animated' : 'produced'} by {movie.productionCompanies.join(', ')}{movie.director && movie.director !== 'Unknown' ? ` and directed by ${movie.director}` : ''}.
                    </p>
                  </details>
                )}
              </div>
            </section>

            {/* Genre links + hub link — internal linking / crawl paths for SEO. */}
            <section>
              <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" />
                Explore More {isAnime ? 'Anime' : 'Animation'} by Genre
              </h2>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/genre/${genreSlug(genre)}`}
                    className="px-4 py-2 rounded-full bg-card border border-border hover:border-primary/40 hover:text-primary text-sm font-medium text-muted-foreground transition-all"
                  >
                    {genre} Movies
                  </Link>
                ))}
                <Link
                  href="/animation"
                  className="px-4 py-2 rounded-full bg-card border border-border hover:border-primary/40 hover:text-primary text-sm font-medium text-muted-foreground transition-all"
                >
                  All Animation &amp; Anime →
                </Link>
              </div>
            </section>

            <section className="text-center py-12 sm:py-16 rounded-2xl bg-card border border-border">
              <Film className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-headline text-xl sm:text-2xl text-foreground mb-2">Need a recommendation?</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">Tell us your mood and we&apos;ll pick the perfect title for you.</p>
              <Link href="/"><Button size="lg" className="rounded-full px-8">Get a Recommendation<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
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
