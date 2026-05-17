import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GenreIcon } from '@/components/genre-icon';
import { GENRES } from '@/lib/genres';

export const metadata: Metadata = {
  title: 'Browse Movies by Genre',
  description: 'Explore movies by genre — Action, Comedy, Drama, Horror, Sci-Fi, Thriller, and more.',
  alternates: { canonical: '/genre' },
};

export default function GenresPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 py-12 pt-24 flex flex-col gap-16">
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-bordercolor pb-4">
            <div>
              <h2 className="display-font text-4xl text-parchment">GENRE ARCHIVE</h2>
              <div className="mono-font text-terracotta mt-1">CLASSIFICATION_MATRIX // ALL CATEGORIES</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRES.map((genre, i) => (
              <Link
                key={genre.slug}
                href={`/genre/${genre.slug}`}
                className="spec-card p-4 cursor-pointer group flex flex-col"
              >
                <div className="flex justify-between mb-6 mono-font text-parchment/40 group-hover:text-terracotta transition-colors">
                  <span>CAT_{String(i + 1).padStart(2, '0')}</span>
                  <span>{genre.slug.slice(0, 3)}</span>
                </div>
                <div className="flex justify-center py-6 border-y border-bordercolor relative">
                  <GenreIcon slug={genre.slug} className="w-8 h-8 text-terracotta transform group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-4 text-center">
                  <div className="display-font text-xl text-parchment tracking-wide group-hover:text-terracotta transition-colors">
                    {genre.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
