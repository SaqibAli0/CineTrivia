"use client";

import { Film, Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <span className="font-headline text-xl text-foreground">CineTrivia.</span>
        </div>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}
