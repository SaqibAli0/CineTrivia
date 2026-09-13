import Link from 'next/link';
import { Tv, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TvNotFound() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <nav className="flex items-center justify-between py-5 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" />
            <span className="font-headline text-xl text-foreground">CineTrivia.</span>
          </Link>
        </nav>

        <main className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
          <Tv className="w-16 h-16 text-muted-foreground opacity-40 mb-6" />
          <h1 className="font-headline text-3xl sm:text-4xl text-foreground mb-3">
            TV Show Not Found
          </h1>
          <p className="text-muted-foreground text-base mb-8 max-w-md">
            We couldn&apos;t find this show in our database. It may have been removed or the URL might be incorrect.
          </p>
          <Link href="/tv">
            <Button className="rounded-full px-6">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Browse TV Shows
            </Button>
          </Link>
        </main>
      </div>
    </div>
  );
}
