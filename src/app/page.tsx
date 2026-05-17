import Link from "next/link";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { MovieRecommendation } from "@/components/movie-recommendation";
import { MovieGrid } from "@/components/movie-grid";
import { MovieOfTheDay } from "@/components/movie-of-the-day";
import { Footer } from "@/components/footer";
import { GenreIcon } from "@/components/genre-icon";
import { getMoviesFromPool } from "@/lib/movie-pool";
import { getMovieOfTheDay } from "@/lib/movie-of-the-day";
import { toMovie, fallbackMovies } from "@/lib/movies";
import { GENRES } from "@/lib/genres";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CineTrivia — Movie Recommendations, Fun Facts & Where to Watch',
  description: 'Get personalized movie recommendations based on your mood. Discover fun facts, trivia, cast info, and find where to watch your next favorite film.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CineTrivia — Movie Recommendations, Fun Facts & Where to Watch',
    description: 'Get personalized movie recommendations based on your mood.',
    type: 'website',
    siteName: 'CineTrivia',
  },
  keywords: ['movie recommendations', 'movie suggestions', 'movie fun facts', 'where to watch movies', 'movie trivia'],
};

export default async function Home() {
  let movies = fallbackMovies;

  const [poolMovies, dailyMovie] = await Promise.all([
    getMoviesFromPool(40).catch(() => []),
    getMovieOfTheDay().catch(() => null),
  ]);

  if (poolMovies.length > 0) {
    movies = poolMovies.map(toMovie);
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 py-8 pt-28 flex flex-col gap-16">
        {/* 1. Recommendation Engine — main feature */}
        <MovieRecommendation />

        {/* 2. Movie of the Day */}
        {dailyMovie && (
          <MovieOfTheDay
            title={dailyMovie.title}
            year={dailyMovie.year}
            posterUrl={dailyMovie.posterUrl}
            rating={dailyMovie.rating}
            genre={dailyMovie.genre}
            overview={dailyMovie.overview}
            director={dailyMovie.director}
            runtime={dailyMovie.runtime}
            date={dailyMovie.date}
          />
        )}

        {/* 3. Parameter Selection — Genres */}
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-bordercolor pb-4">
            <div>
              <h2 className="display-font text-4xl text-parchment">Browse by Genre</h2>
              <div className="mono-font text-terracotta mt-1">Browse by genre</div>
            </div>
            <div className="mono-font text-parchment/40 hidden sm:block">Pick a category</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {GENRES.slice(0, 6).map((genre, i) => (
              <Link
                key={genre.slug}
                href={`/genre/${genre.slug}`}
                className="spec-card p-4 cursor-pointer group flex flex-col"
              >
                <div className="flex justify-between mb-6 mono-font text-parchment/40 group-hover:text-terracotta transition-colors">
                  <span>P_{String(i + 1).padStart(2, '0')}</span>
                  <span>{genre.slug.slice(0, 3)}</span>
                </div>
                <div className="flex justify-center py-6 border-y border-bordercolor relative">
                  <GenreIcon slug={genre.slug} className="w-8 h-8 text-terracotta transform group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-4 text-center">
                  <div className="display-font text-lg sm:text-xl text-parchment tracking-wide truncate px-1">{genre.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Retrieved Assets — Movie Grid */}
        <MovieGrid movies={movies} />
      </main>

      <Footer />

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'CineTrivia',
            url: process.env.NEXT_PUBLIC_SITE_URL  ,
          }),
        }}
      />
    </div>
  );
}
