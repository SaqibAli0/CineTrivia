"use client";

import { Film, Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="flex items-center justify-between py-5 border-b border-border/40">
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
    </nav>
  );
}
