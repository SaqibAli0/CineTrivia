import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ImageIcon, Film } from 'lucide-react';
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
  if (!genre) return { title: 'Genre Not Found' };
  return {
    title: `Best ${genre.name} Movies — Top Rated Films`,
    description: `Discover the best ${genre.name.toLowerCase()} movies with ratings, fun facts, and where to watch.`,
    alternates: { canonical: `/genre/${slug}` },
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

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 py-12 pt-24 flex flex-col gap-16">
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-bordercolor pb-4">
            <div className="flex items-center gap-4">
              <GenreIcon slug={genre.slug} className="w-8 h-8 text-terracotta" />
              <div>
                <h1 className="display-font text-4xl text-parchment">{genre.name} Archive</h1>
                <div className="mono-font text-terracotta mt-1">Category: {genre.slug} // Records: {movies.length}</div>
              </div>
            </div>
          </div>

          {movies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {movies.map((movie, i) => (
                <Link key={movie.id} href={`/movie/${movie.slug}`} className="spec-card p-5 group cursor-pointer block">
                  <div className="flex justify-between mb-4 mono-font text-parchment/50 border-b border-bordercolor pb-2">
                    <span>ID: {String(i + 1).padStart(3, '0')}</span>
                    <span>{movie.year}</span>
                  </div>
                  <div className="visual-preview aspect-[2/3] bg-black/30 mb-4 relative">
                    <div className="crosshair-corner cc-tl" />
                    <div className="crosshair-corner cc-tr" />
                    <div className="crosshair-corner cc-bl" />
                    <div className="crosshair-corner cc-br" />
                    {movie.posterUrl ? (
                      <Image src={movie.posterUrl} alt={movie.title} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover image-filter" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <ImageIcon className="w-10 h-10 text-parchment/20" />
                      </div>
                    )}
                  </div>
                  <h3 className="display-font text-2xl text-parchment mb-1 group-hover:text-terracotta transition-colors truncate">
                    {movie.title}
                  </h3>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-bordercolor border-dashed">
                    <span className="mono-font text-parchment/60">{movie.year}</span>
                    {movie.rating > 0 && <span className="mono-font text-terracotta">R // {movie.rating}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-bordercolor">
              <Film className="w-10 h-10 text-parchment/30 mx-auto mb-4" />
              <p className="mono-font text-parchment">RETRIEVING RECORDS...</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
