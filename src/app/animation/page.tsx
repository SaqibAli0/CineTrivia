import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MediaGrid } from '@/components/media-grid';
import { MediaSearchBox } from '@/components/media-search-box';
import { getAnimationSeriesCollection } from '@/lib/tvmaze';
import { getAnimatedFilmsCollection } from '@/lib/tmdb-tv';
import type { MediaItem } from '@/lib/media';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Anime & Animation — Watch Anime Online, Facts & Where to Stream',
  description:
    'Browse anime and animated films and series — from Studio Ghibli and top anime studios to Pixar. Watch anime online, get facts, cast, ratings, and where to stream, subbed and dubbed.',
  keywords: ['anime', 'watch anime online', 'anime series', 'anime movies', 'animation', 'subbed and dubbed'],
  alternates: { canonical: '/animation' },
  openGraph: {
    title: 'Anime & Animation | CineTrivia',
    description: 'Watch anime online plus animated films and series from every region. Facts, cast, ratings, and where to stream.',
    type: 'website',
  },
};

/** Interleave two lists so films and series both surface near the top. */
function interleave(a: MediaItem[], b: MediaItem[]): MediaItem[] {
  const out: MediaItem[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

export default async function AnimationLandingPage() {
  // Series (TVmaze) + films (TMDB) in parallel; either can fail independently.
  const [series, films] = await Promise.all([
    getAnimationSeriesCollection(12).catch(() => [] as MediaItem[]),
    getAnimatedFilmsCollection(12).catch(() => [] as MediaItem[]),
  ]);

  // Dedupe by source+id, then interleave for a mixed feel.
  const seen = new Set<string>();
  const dedupe = (list: MediaItem[]) =>
    list.filter((m) => {
      const key = `${m.source}-${m.id}`;
      return seen.has(key) ? false : (seen.add(key), true);
    });

  const items = interleave(dedupe(series), dedupe(films)).slice(0, 24);

  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="py-8 sm:py-12 space-y-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-foreground mb-3">
              Anime &amp; Animation
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Animated films and series from every region — from Pixar and Studio Ghibli to
              anime classics. Facts, cast, ratings, and where to watch.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mt-3">
              Looking for anime? Explore anime series and anime films from studios like Studio
              Ghibli, MAPPA, Ufotable, and Madhouse — find episodes, cast, and where to stream
              online, subbed and dubbed.
            </p>
          </div>

          <MediaSearchBox scope="animation" placeholder="Search anime & animation..." />

          <section id="popular-anime" className="scroll-mt-20">
            <h2 className="font-headline text-2xl sm:text-3xl text-foreground mb-4">
              Popular Anime &amp; Animation
            </h2>
            <MediaGrid items={items} emptyMessage="Animated titles will appear here shortly." />
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
