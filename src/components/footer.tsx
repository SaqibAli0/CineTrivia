import Link from "next/link";
import { Film } from "lucide-react";
import { KofiButton } from "./kofi-button";

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
            Personalized movie recommendations, fun facts, and trivia. Find your next favorite film.
          </p>
        </div>

        {/* Explore */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Explore</p>
          <nav className="space-y-2 text-xs sm:text-sm text-muted-foreground" aria-label="Explore links">
            <Link href="/" className="block hover:text-foreground transition-colors">Movies</Link>
            <Link href="/tv" className="block hover:text-foreground transition-colors">TV Shows</Link>
            <Link href="/animation" className="block hover:text-foreground transition-colors">Animation &amp; Anime</Link>
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

      {/* Support widget — renders only when NEXT_PUBLIC_KOFI_URL is set */}
      <div className="mb-6">
        <KofiButton variant="card" />
      </div>

      <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>&copy; 2025 CineTrivia. All rights reserved.</p>
        <p>CineTrivia is an independent platform.</p>
      </div>

      {/* Data attribution — TVmaze content is licensed CC BY-SA and requires
          visible attribution with a link. TMDB attribution kept alongside. */}
      <div className="pt-4 text-center sm:text-left">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          TV &amp; animated-series data provided by{" "}
          <a
            href="https://www.tvmaze.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            TVmaze
          </a>{" "}
          (licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            CC BY-SA
          </a>
          ). Movie &amp; animated-film data provided by TMDB. This product uses
          the TMDB and TVmaze APIs but is not endorsed or certified by either.
        </p>
      </div>
    </footer>
  );
}
