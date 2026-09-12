import { Metadata } from 'next';
import { Search as SearchIcon } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SearchBox } from '@/components/search-box';
import { SearchResults } from '@/components/search-results';
import { searchMovies } from '@/app/search-actions';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  return {
    title: query ? `Search results for "${query}"` : 'Search Movies',
    description: query
      ? `Movies matching "${query}" on CineTrivia — with ratings, details, and where to watch.`
      : 'Search thousands of movies on CineTrivia by title.',
    // Search result pages are thin/duplicative — keep them out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const initial = query ? await searchMovies(query, 1) : null;

  return (
    <div className="bg-background min-h-screen text-foreground pt-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <Navbar />
        <main className="py-8 sm:py-12 space-y-8">
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl text-foreground mb-2">
              {query ? (
                <>Search results for &ldquo;{query}&rdquo;</>
              ) : (
                'Search Movies'
              )}
            </h1>
            {query && initial && (
              <p className="text-muted-foreground text-sm">
                {initial.totalResults > 0
                  ? `Showing top matches${initial.totalResults > initial.movies.length ? ` of ${initial.totalResults.toLocaleString()}` : ''} for “${query}”`
                  : 'No results'}
              </p>
            )}
          </div>

          <SearchBox placeholder="Search any movie by title..." />

          {!query ? (
            <div className="text-center py-16 space-y-3">
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-lg font-medium text-foreground">Search for a movie</p>
              <p className="text-muted-foreground text-sm">
                Type a title above to find films, ratings, and where to watch.
              </p>
            </div>
          ) : (
            <SearchResults
              query={query}
              initialMovies={initial?.movies ?? []}
              initialHasMore={initial?.hasMore ?? false}
              initialUnavailable={initial?.unavailable ?? false}
            />
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
