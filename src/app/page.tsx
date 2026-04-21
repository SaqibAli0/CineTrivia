import { Navbar } from "@/components/navbar";
import { MovieRecommendation } from "@/components/movie-recommendation";
import { MovieGrid } from "@/components/movie-grid";
import { Footer } from "@/components/footer";
import { movies } from "@/lib/movies";

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <Navbar />
        <main className="space-y-16 md:space-y-24">
          <MovieRecommendation />
          <MovieGrid movies={movies} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
