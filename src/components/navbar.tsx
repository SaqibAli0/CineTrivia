"use client";

import Link from "next/link";
import { Menu, X, Search, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toSlug } from "@/lib/slug";

interface SearchResult {
  id: number;
  title: string;
  year: number;
  posterUrl: string;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowResults(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleSearch(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setShowResults(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-md border-b border-bordercolor px-6 py-4 flex justify-between items-center w-full">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="display-font text-3xl sm:text-4xl text-terracotta leading-none tracking-tighter whitespace-nowrap">
          CineTrivia
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-8 mono-font !text-[14px] text-parchment/70">
          <Link href="/" className="nav-link hover:text-parchment">Home</Link>
          <Link href="/genre" className="nav-link hover:text-parchment">Genres</Link>
          <Link href="/blog" className="nav-link hover:text-parchment">Blog</Link>
          <Link href="/about" className="nav-link hover:text-parchment">About</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div ref={searchRef} className="relative hidden sm:block">
          <div className="flex items-center border border-bordercolor bg-black/20 px-3 py-2 w-56 md:w-80 focus-within:border-terracotta transition-colors group">
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-terracotta animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-parchment/50 group-focus-within:text-terracotta transition-colors" />
            )}
            <input
              type="text"
              placeholder="Search your movie... ( / )"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if (results.length > 0) setShowResults(true); }}
              ref={inputRef}
              className="bg-transparent border-none mono-font ml-3 w-full placeholder:text-parchment/30 text-parchment focus:outline-none"
            />
          </div>

          {/* Search results dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 border border-bordercolor bg-charcoal/98 backdrop-blur-md z-50 max-h-[300px] overflow-y-auto">
              {results.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${toSlug(movie.title, movie.year)}`}
                  onClick={() => { setShowResults(false); setQuery(""); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-parchment/5 transition-colors border-b border-bordercolor last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="mono-font text-parchment truncate">{movie.title}</p>
                    <p className="mono-font text-parchment/40 text-[9px]">{movie.year}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="hidden lg:block mono-font text-[8px] text-terracotta text-right leading-tight border-l border-bordercolor pl-4">
          Status: Online<br />
          All systems operational
        </div>

        {/* Mobile search toggle */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="sm:hidden text-parchment/70 hover:text-terracotta transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-parchment/70 hover:text-parchment"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden border-b border-bordercolor bg-charcoal/95 backdrop-blur-md px-6 py-4 space-y-3 mono-font text-parchment/70">
          <Link href="/" onClick={() => setMobileOpen(false)} className="block hover:text-terracotta transition-colors">Home</Link>
          <Link href="/genre" onClick={() => setMobileOpen(false)} className="block hover:text-terracotta transition-colors">Genres</Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)} className="block hover:text-terracotta transition-colors">Blog</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className="block hover:text-terracotta transition-colors">About</Link>
        </div>
      )}

      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="absolute top-full left-0 right-0 sm:hidden border-b border-bordercolor bg-charcoal/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-center border border-bordercolor bg-black/20 px-3 py-2 focus-within:border-terracotta transition-colors">
            <Search className="w-3.5 h-3.5 text-parchment/50" />
            <input
              type="text"
              placeholder="Search your movie..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
              className="bg-transparent border-none mono-font ml-3 w-full placeholder:text-parchment/30 text-parchment focus:outline-none"
            />
          </div>
          {results.length > 0 && (
            <div className="mt-2 border border-bordercolor bg-charcoal max-h-[250px] overflow-y-auto">
              {results.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${toSlug(movie.title, movie.year)}`}
                  onClick={() => { setMobileSearchOpen(false); setQuery(""); setResults([]); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-parchment/5 transition-colors border-b border-bordercolor last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="mono-font text-parchment truncate">{movie.title}</p>
                    <p className="mono-font text-parchment/40 text-[9px]">{movie.year}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
