import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { MovieRecommendation } from "@/components/movie-recommendation";
import { MovieGrid } from "@/components/movie-grid";
import { MovieOfTheDay } from "@/components/movie-of-the-day";
import { Footer } from "@/components/footer";
import { getMoviesFromPool } from "@/lib/movie-pool";
import { getMovieOfTheDay } from "@/lib/movie-of-the-day";
import { toMovie, fallbackMovies } from "@/lib/movies";
import { GENRES } from "@/lib/genres";

// Force dynamic rendering so the shuffle produces a fresh order on every request
export const dynamic = 'force-dynamic';

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
    <div className="bg-background min-h-screen text-foreground pt-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="space-y-6 sm:space-y-8 md:space-y-10">
          <MovieRecommendation />

          {/* Movie of the Day */}
          {dailyMovie && (
            <MovieOfTheDay
              title={dailyMovie.title}
              year={dailyMovie.year}
              posterUrl={dailyMovie.posterUrl}
              rating={dailyMovie.rating}
              genre={dailyMovie.genre}
              overview={dailyMovie.overview}
              date={dailyMovie.date}
            />
          )}

          <MovieGrid movies={movies} />

          {/* Genre Quick Links */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-headline text-2xl sm:text-3xl text-foreground mb-1">
                  Browse by Genre
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Find movies in your favorite category.
                </p>
              </div>
              <Link
                href="/genre"
                className="text-sm text-primary hover:underline hidden sm:inline-flex"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {GENRES.slice(0, 12).map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/genre/${genre.slug}`}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-sm"
                >
                  <span className="text-xl sm:text-2xl mb-1">{genre.emoji}</span>
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground">
                    {genre.name}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/genre"
              className="block text-center text-sm text-primary hover:underline mt-4 sm:hidden"
            >
              View all genres &rarr;
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
