import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 sm:py-12 mt-10 sm:mt-16">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Film className="w-4 h-4 text-primary" />
            <span className="font-headline text-lg text-foreground">CineTrivia.</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI-powered movie recommendations, fun facts, and trivia. Find your next favorite film.
          </p>
        </div>

        {/* Explore */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Explore</p>
          <nav className="space-y-2 text-xs sm:text-sm text-muted-foreground" aria-label="Explore links">
            <Link href="/" className="block hover:text-foreground transition-colors">Home</Link>
            <Link href="/genre" className="block hover:text-foreground transition-colors">Browse Genres</Link>
            <Link href="/blog" className="block hover:text-foreground transition-colors">Blog</Link>
          </nav>
        </div>

        {/* Popular Genres */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Genres</p>
          <nav className="space-y-2 text-xs sm:text-sm text-muted-foreground" aria-label="Genre links">
            <Link href="/genre/action" className="block hover:text-foreground transition-colors">Action Movies</Link>
            <Link href="/genre/comedy" className="block hover:text-foreground transition-colors">Comedy Movies</Link>
            <Link href="/genre/horror" className="block hover:text-foreground transition-colors">Horror Movies</Link>
            <Link href="/genre/sci-fi" className="block hover:text-foreground transition-colors">Sci-Fi Movies</Link>
            <Link href="/genre/drama" className="block hover:text-foreground transition-colors">Drama Movies</Link>
            <Link href="/genre/thriller" className="block hover:text-foreground transition-colors">Thriller Movies</Link>
          </nav>
        </div>

        {/* Company */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Company</p>
          <nav className="space-y-2 text-xs sm:text-sm text-muted-foreground" aria-label="Company links">
            <Link href="/about" className="block hover:text-foreground transition-colors">About Us</Link>
            <Link href="/privacy" className="block hover:text-foreground transition-colors">Privacy Policy</Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CineTrivia. All rights reserved.</p>
        <p>Movie data provided by TMDB. CineTrivia is not endorsed by TMDB.</p>
      </div>
    </footer>
  );
}
