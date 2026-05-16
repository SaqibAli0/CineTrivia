import { Navbar } from "@/components/navbar";
import { MovieRecommendation } from "@/components/movie-recommendation";
import { MovieGrid } from "@/components/movie-grid";
import { Footer } from "@/components/footer";
import { getMoviesFromPool } from "@/lib/movie-pool";
import { toMovie, fallbackMovies } from "@/lib/movies";

// Force dynamic rendering so the shuffle produces a fresh order on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  let movies = fallbackMovies;

  try {
    const poolMovies = await getMoviesFromPool(40);
    if (poolMovies.length > 0) {
      movies = poolMovies.map(toMovie);
    }
  } catch (error) {
    console.error('Movie pool fetch failed, using fallback:', error);
  }

  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="space-y-8 sm:space-y-12 md:space-y-24">
          <MovieRecommendation />
          <MovieGrid movies={movies} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
