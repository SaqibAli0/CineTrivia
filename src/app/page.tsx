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

// Force dynamic rendering so the shuffle produces a fresh order on every request
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CineTrivia — Movie Recommendations, Fun Facts & Where to Watch',
  description: 'Get personalized movie recommendations based on your mood. Discover fun facts, trivia, cast info, and find where to watch your next favorite film. Updated daily.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CineTrivia — Movie Recommendations, Fun Facts & Where to Watch',
    description: 'Get personalized movie recommendations based on your mood. Discover fun facts, trivia, and find where to watch.',
    type: 'website',
    siteName: 'CineTrivia',
  },
  keywords: ['movie recommendations', 'movie suggestions', 'movie fun facts', 'where to watch movies', 'movie trivia', 'film recommendations', 'what to watch tonight'],
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
    <div className="bg-background min-h-screen text-foreground pt-16">
      {/* Homepage FAQ Schema for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is CineTrivia?',
                acceptedAnswer: { '@type': 'Answer', text: 'CineTrivia is a free movie recommendation platform. Tell us your mood or preferred genres, and we\'ll suggest the perfect movie for you — complete with fun facts, cast info, ratings, and links to where you can watch it.' },
              },
              {
                '@type': 'Question',
                name: 'How do I get a movie recommendation?',
                acceptedAnswer: { '@type': 'Answer', text: 'Simply select one or more genres (like Action, Comedy, or Horror) and optionally choose a mood (like Exciting or Relaxing). Click "Get Recommendation" and we\'ll instantly suggest a movie tailored to your preferences.' },
              },
              {
                '@type': 'Question',
                name: 'Is CineTrivia free to use?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes, CineTrivia is completely free. You can get unlimited movie recommendations, browse our movie database, read fun facts, and find streaming links — all without creating an account.' },
              },
              {
                '@type': 'Question',
                name: 'Where does the movie data come from?',
                acceptedAnswer: { '@type': 'Answer', text: 'Our movie information is sourced from trusted public databases, providing up-to-date details on ratings, cast, crew, streaming availability, and more for thousands of films.' },
              },
              {
                '@type': 'Question',
                name: 'Can I find where to watch a specific movie?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes! Every movie page on CineTrivia shows current streaming platforms, rental options, and purchase links so you can start watching immediately.' },
              },
            ],
          }),
        }}
      />
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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {GENRES.slice(0, 6).map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/genre/${genre.slug}`}
                  className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-sm"
                >
                  <GenreIcon slug={genre.slug} className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1.5" />
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
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

          {/* How It Works — targets "how to get movie recommendations" queries */}
          <section className="py-8 sm:py-12">
            <h2 className="font-headline text-2xl sm:text-3xl text-foreground text-center mb-3">
              How CineTrivia Works
            </h2>
            <p className="text-muted-foreground text-sm text-center max-w-xl mx-auto mb-8">
              Get personalized movie recommendations in seconds using our smart recommendation engine.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-5 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-medium text-foreground mb-1.5 text-sm">Pick Your Mood</h3>
                <p className="text-xs text-muted-foreground">Select genres and a mood that matches how you feel tonight.</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="font-medium text-foreground mb-1.5 text-sm">We Pick a Film</h3>
                <p className="text-xs text-muted-foreground">We analyze thousands of movies to find the perfect match.</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h3 className="font-medium text-foreground mb-1.5 text-sm">Watch & Enjoy</h3>
                <p className="text-xs text-muted-foreground">Find where to stream it, discover fun facts, and explore similar films.</p>
              </div>
            </div>
          </section>

          {/* FAQ Section — targets long-tail search queries */}
          <section className="py-6 sm:py-8">
            <h2 className="font-headline text-2xl sm:text-3xl text-foreground text-center mb-6">
              Frequently Asked Questions
            </h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                  What is CineTrivia?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  CineTrivia is a free movie recommendation platform. Tell us your mood or preferred genres, and we&apos;ll suggest the perfect movie for you — complete with fun facts, cast info, ratings, and links to where you can watch it.
                </p>
              </details>
              <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                  How do I get a movie recommendation?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  Simply select one or more genres (like Action, Comedy, or Horror) and optionally choose a mood (like Exciting or Relaxing). Click &quot;Get Recommendation&quot; and we&apos;ll instantly suggest a movie tailored to your preferences.
                </p>
              </details>
              <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                  Is CineTrivia free to use?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  Yes, CineTrivia is completely free. You can get unlimited movie recommendations, browse our movie database, read fun facts, and find streaming links — all without creating an account.
                </p>
              </details>
              <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                  Where does the movie data come from?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  Our movie information is sourced from trusted public databases, providing up-to-date details on ratings, cast, crew, streaming availability, and more for thousands of films.
                </p>
              </details>
              <details className="group rounded-xl bg-card border border-border p-4 cursor-pointer">
                <summary className="font-medium text-sm text-foreground list-none flex items-center justify-between">
                  Can I find where to watch a specific movie?
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                  Yes! Every movie page on CineTrivia shows current streaming platforms, rental options, and purchase links so you can start watching immediately.
                </p>
              </details>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
