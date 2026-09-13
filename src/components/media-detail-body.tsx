import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Tv,
  Globe,
  Sparkles,
  Calendar,
  Layers,
  ListVideo,
  Radio,
  Activity,
  ArrowRight,
  Clapperboard,
} from 'lucide-react';
import { SITE_URL } from '@/lib/site';
import type { TvShowDetails } from '@/lib/tvmaze';
import type { TvGapFill } from '@/lib/tmdb-tv';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FunFactButton } from '@/components/fun-fact-button';
import { SimilarMoviesGrid } from '@/components/similar-movies-grid';
import { WatchButtons } from '@/components/watch-buttons';
import { TvSeriesJsonLd } from '@/components/tv-series-json-ld';
import { MediaRetryReset } from '@/components/media-retry-reset';
import { CastCarousel } from '@/components/cast-carousel';
import { SocialShare } from '@/components/social-share';
import { AdSenseSlot } from '@/components/adsense-slot';

interface MediaDetailBodyProps {
  show: TvShowDetails;
  gap: TvGapFill;
  /** Full detail path, e.g. "/tv/stranger-things-2016". */
  path: string;
  /** Section label shown in headings/copy, e.g. "TV Show" or "Animation". */
  sectionLabel: 'TV Show' | 'Animation';
}

/**
 * Shared server-rendered body for TV and animated-SERIES detail pages. Mirrors
 * the movie page (hero, cast, watch, facts, similar, FAQ, JSON-LD, fun fact,
 * share) but with TV facts: seasons, total episodes, status, first-air year,
 * network. Gap-fill data (similar/providers/trailer) comes from TMDB via the
 * show's IMDB id and is best-effort — sections omit cleanly when empty.
 */
export function MediaDetailBody({ show, gap, path, sectionLabel }: MediaDetailBodyProps) {
  const siteUrl = SITE_URL;
  const { similar, providers, trailer, backdropUrl } = gap;
  const heading = sectionLabel === 'Animation' ? 'Animation Facts' : 'Show Facts';

  const yearRange =
    show.endYear && show.endYear !== show.year
      ? `${show.year}–${show.endYear}`
      : show.status.toLowerCase() === 'running'
      ? `${show.year}–present`
      : String(show.year);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: sectionLabel, item: `${siteUrl}${path.split('/').slice(0, 2).join('/')}` },
      { '@type': 'ListItem', position: 3, name: `${show.title} (${show.year})` },
    ],
  };

  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <MediaRetryReset path={path} />
      <TvSeriesJsonLd show={show} path={path} trailer={trailer} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main>
          {/* Hero */}
          <section className="relative -mx-4 sm:-mx-6 md:-mx-8 overflow-hidden">
            <div className="absolute inset-0">
              {backdropUrl ? (
                <>
                  {/* Real wide TMDB backdrop (resolved via the show's IMDB id) —
                      identical treatment to the movie page. */}
                  <Image src={backdropUrl} alt="" fill className="object-cover" priority sizes="100vw" aria-hidden="true" />
                  {/* Subtle backdrop: a strong dark wash keeps it a faint hint
                      (not a bold image), and the gradient keeps text legible. */}
                  <div className="absolute inset-0 bg-background/85 dark:bg-background/88" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/75" />
                </>
              ) : show.posterUrl ? (
                <>
                  {/* No TMDB backdrop → blurred poster fallback with a lighter
                      overlay so it still reads as a cinematic backdrop. */}
                  <Image src={show.posterUrl} alt="" fill className="object-cover scale-125 blur-2xl opacity-60" priority sizes="100vw" aria-hidden="true" />
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
                    {show.posterUrl ? (
                      <Image src={show.posterUrl} alt={`${show.title} poster`} width={300} height={450} className="object-cover w-full h-full" priority />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Tv className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight text-foreground mb-2">
                    {show.title}
                    <span className="text-muted-foreground font-normal text-lg sm:text-xl md:text-2xl ml-2">({yearRange})</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-4">
                    <span>{show.genres.join(', ') || sectionLabel}</span>
                    <span>•</span>
                    <span>{show.language}</span>
                    {show.network && show.network !== 'Unknown' && (<><span>•</span><span>{show.network}</span></>)}
                  </div>
                  {show.rating > 0 && (
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <span className="text-xl font-bold">{show.rating}</span>
                        <span className="text-muted-foreground text-sm">/10</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{show.status}</span>
                    </div>
                  )}
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">Overview</h3>
                    <p className="text-sm sm:text-[15px] leading-relaxed text-muted-foreground max-w-2xl line-clamp-4 md:line-clamp-none">{show.overview}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5 text-sm">
                    {show.network && show.network !== 'Unknown' && (
                      <div><p className="text-muted-foreground text-xs">Network</p><p className="font-medium text-foreground">{show.network}</p></div>
                    )}
                    {show.seasons > 0 && (
                      <div><p className="text-muted-foreground text-xs">Seasons</p><p className="font-medium text-foreground">{show.seasons}</p></div>
                    )}
                    {show.totalEpisodes > 0 && (
                      <div><p className="text-muted-foreground text-xs">Episodes</p><p className="font-medium text-foreground">{show.totalEpisodes}</p></div>
                    )}
                    <div><p className="text-muted-foreground text-xs">Status</p><p className="font-medium text-foreground">{show.status}</p></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <FunFactButton movieTitle={show.title} mediaType={sectionLabel === 'Animation' ? 'animation' : 'tv'} />
                    <SocialShare
                      title={`${show.title} (${show.year})`}
                      url={`${siteUrl}${path}`}
                      description={`Discover facts about ${show.title}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Body */}
          <div className="space-y-12 sm:space-y-16 py-10 sm:py-14">
            {show.cast.length > 0 && (
              <section>
                <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-6 flex items-center gap-2">
                  <Clapperboard className="w-5 h-5 text-primary" />
                  Cast
                </h2>
                <CastCarousel cast={show.cast} />
              </section>
            )}

            <section>
              <WatchButtons movieTitle={show.title} year={show.year} providers={providers} />
            </section>

            <section>
              <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-5 flex items-center gap-2">
                <Tv className="w-5 h-5 text-primary" />
                {heading}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                <FactCard label="First Aired" value={String(show.year)} icon={<Calendar className="w-5 h-5" />} />
                {show.seasons > 0 && <FactCard label="Seasons" value={String(show.seasons)} icon={<Layers className="w-5 h-5" />} />}
                {show.totalEpisodes > 0 && <FactCard label="Episodes" value={String(show.totalEpisodes)} icon={<ListVideo className="w-5 h-5" />} />}
                <FactCard label="Status" value={show.status} icon={<Activity className="w-5 h-5" />} />
                {show.network && show.network !== 'Unknown' && <FactCard label="Network" value={show.network} icon={<Radio className="w-5 h-5" />} />}
                <FactCard label="Language" value={show.language} icon={<Globe className="w-5 h-5" />} />
                {show.rating > 0 && <FactCard label="Rating" value={`${show.rating} / 10`} icon={<Star className="w-5 h-5" />} />}
              </div>
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

            {/* FAQ */}
            <section>
              <h2 className="font-headline text-xl sm:text-2xl text-foreground mb-5 flex items-center gap-2">
                <Tv className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                  <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                    Where can I watch {show.title}?
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                    Check the &quot;Where to Watch&quot; section above for current streaming platforms and options for {show.title}.
                  </p>
                </details>
                <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                  <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                    What is {show.title} about?
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">{show.overview}</p>
                </details>
                {show.seasons > 0 && (
                  <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                    <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                      How many seasons does {show.title} have?
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                      {show.title} has {show.seasons} season{show.seasons > 1 ? 's' : ''}
                      {show.totalEpisodes > 0 ? ` and ${show.totalEpisodes} episodes in total` : ''}. The series is currently {show.status.toLowerCase()}.
                    </p>
                  </details>
                )}
                {show.cast.length > 0 && (
                  <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                    <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                      Who stars in {show.title}?
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                      The cast of {show.title} includes {show.cast.slice(0, 5).map((c) => (c.character ? `${c.name} as ${c.character}` : c.name)).join(', ')}{show.cast.length > 5 ? ' and more' : ''}.
                    </p>
                  </details>
                )}
              </div>
            </section>

            <section className="text-center py-12 sm:py-16 rounded-2xl bg-card border border-border">
              <Tv className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-headline text-xl sm:text-2xl text-foreground mb-2">Looking for something to watch?</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">Tell us your mood and we&apos;ll pick the perfect title for you.</p>
              <Link href="/"><Button size="lg" className="rounded-full px-8">Get a Recommendation<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </section>

            {/* TVmaze attribution (CC BY-SA) — also linked inline on the page. */}
            <p className="text-center text-[11px] text-muted-foreground/60">
              Series data from{' '}
              <a href={show.tvmazeUrl || 'https://www.tvmaze.com/'} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                TVmaze
              </a>{' '}
              (CC BY-SA). Enrichment via TMDB.
            </p>
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
