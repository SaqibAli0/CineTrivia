import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MediaGrid } from '@/components/media-grid';
import { MediaSearchBox } from '@/components/media-search-box';
import { getTvCollection } from '@/lib/tvmaze';

// Refresh daily; the collection itself is cached server-side.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'TV Shows — Facts, Seasons & Where to Watch',
  description:
    'Browse popular TV shows with seasons, episodes, cast, ratings, and where to watch. Discover your next binge on CineTrivia.',
  alternates: { canonical: '/tv' },
  openGraph: {
    title: 'TV Shows | CineTrivia',
    description: 'Browse popular TV shows with seasons, episodes, cast, and where to watch.',
    type: 'website',
  },
};

export default async function TvLandingPage() {
  const items = await getTvCollection(20).catch(() => []);

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
              TV Shows
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Explore popular series with seasons, episodes, cast, ratings, and streaming
              info. Fresh picks on every visit.
            </p>
          </div>

          <MediaSearchBox scope="tv" placeholder="Search TV shows..." />

          <MediaGrid items={items} emptyMessage="TV shows will appear here shortly." />
        </main>
        <Footer />
      </div>
    </div>
  );
}
