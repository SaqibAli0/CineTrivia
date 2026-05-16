"use client";

import Link from "next/link";
import { Film, Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./theme-provider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Film className="w-5 h-5 text-primary" />
          <span className="font-headline text-xl text-foreground">CineTrivia.</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/genre" className="text-muted-foreground hover:text-foreground transition-colors">Genres</Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg px-4 py-3 space-y-2">
          <Link href="/genre" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Genres</Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
        </div>
      )}
    </nav>
  );
}
