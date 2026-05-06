import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { MovieRecommendation } from "@/components/movie-recommendation";
import { MovieGrid } from "@/components/movie-grid";
import { MovieGridSkeleton } from "@/components/movie-grid-skeleton";
import { Footer } from "@/components/footer";
import { getMoviesFromPool } from "@/lib/movie-pool";
import { toMovie, fallbackMovies } from "@/lib/movies";

// Revalidate every hour — keeps TMDB usage well within free tier
export const revalidate = 3600;

async function MovieCollection() {
  let movies = fallbackMovies;

  try {
    const poolMovies = await getMoviesFromPool(20);
    if (poolMovies.length > 0) {
      movies = poolMovies.map(toMovie);
    }
  } catch (error) {
    console.error('Movie pool fetch failed, using fallback:', error);
  }

  return <MovieGrid movies={movies} />;
}

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <Navbar />
        <main className="space-y-16 md:space-y-24">
          <MovieRecommendation />
          <Suspense fallback={<MovieGridSkeleton />}>
            <MovieCollection />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}
