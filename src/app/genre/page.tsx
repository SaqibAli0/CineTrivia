import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GENRES } from '@/lib/genres';

export const metadata: Metadata = {
  title: 'Browse Movies by Genre | CineTrivia',
  description: 'Explore movies by genre — Action, Comedy, Drama, Horror, Sci-Fi, Thriller, and more. Find your next favorite film.',
  openGraph: {
    title: 'Browse Movies by Genre | CineTrivia',
    description: 'Explore movies by genre — Action, Comedy, Drama, Horror, Sci-Fi, and more.',
    type: 'website',
  },
};

export default function GenresPage() {
  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="py-8 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-10">
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-foreground mb-3">
              Browse by Genre
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Explore our collection by genre. Each page features top-rated films with ratings, fun facts, and streaming info.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {GENRES.map((genre) => (
              <Link
                key={genre.slug}
                href={`/genre/${genre.slug}`}
                className="group flex flex-col items-center justify-center p-5 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-md"
              >
                <span className="text-3xl sm:text-4xl mb-2">{genre.emoji}</span>
                <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  {genre.name}
                </span>
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
