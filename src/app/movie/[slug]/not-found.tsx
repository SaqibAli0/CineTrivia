import Link from 'next/link';
import { Film, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MovieNotFound() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <nav className="flex items-center justify-between py-5 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            <span className="font-headline text-xl text-foreground">CineTrivia.</span>
          </Link>
        </nav>

        <main className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
          <Film className="w-16 h-16 text-muted-foreground opacity-40 mb-6" />
          <h1 className="font-headline text-3xl sm:text-4xl text-foreground mb-3">
            Movie Not Found
          </h1>
          <p className="text-muted-foreground text-base mb-8 max-w-md">
            We couldn&apos;t find this movie in our database. It may have been removed or the URL might be incorrect.
          </p>
          <Link href="/">
            <Button className="rounded-full px-6">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Collection
            </Button>
          </Link>
        </main>
      </div>
    </div>
  );
}
