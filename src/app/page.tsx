import { Header } from "@/components/header";
import { MovieRecommendation } from "@/components/movie-recommendation";
import { MovieGrid } from "@/components/movie-grid";
import { movies } from "@/lib/movies";

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="space-y-12">
          <MovieRecommendation />
          <section aria-labelledby="movie-grid-heading">
            <h2 id="movie-grid-heading" className="text-2xl font-bold mb-6">
              Explore Our Collection
            </h2>
            <MovieGrid movies={movies} />
          </section>
        </main>
      </div>
    </div>
  );
}
