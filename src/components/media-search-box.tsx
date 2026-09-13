"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, ImageIcon, ArrowRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchMedia, type MediaSearchScope } from "@/app/media-search-actions";
import { mediaHref, mediaTypeLabel, type MediaItem } from "@/lib/media";
import { MIN_QUERY_LENGTH, SEARCH_DEBOUNCE_MS, DROPDOWN_RESULT_COUNT } from "@/lib/search";

interface MediaSearchBoxProps {
  /** Which section to search within: 'tv' or 'animation' (or 'all'). */
  scope: MediaSearchScope;
  placeholder?: string;
  className?: string;
}

/**
 * Debounced live-search dropdown for TV / animation sections. Mirrors the
 * movie SearchBox UX but queries `searchMedia` (TVmaze + TMDB) scoped to the
 * section, and routes each result via `mediaHref` (→ /tv or /animation).
 * The "More results" row goes to /search?q=... (cross-source results page).
 */
export function MediaSearchBox({ scope, placeholder, className }: MediaSearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const goToSearchPage = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) return;
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router]
  );

  const goToItem = useCallback(
    (item: MediaItem) => {
      setOpen(false);
      router.push(mediaHref(item));
    },
    [router]
  );

  // Debounced search effect.
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setUnavailable(false);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);
    const currentRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const res = await searchMedia(trimmed, scope, DROPDOWN_RESULT_COUNT);
        if (currentRequest !== requestId.current) return; // stale
        setResults(res.items.slice(0, DROPDOWN_RESULT_COUNT));
        setUnavailable(Boolean(res.unavailable));
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        if (currentRequest !== requestId.current) return;
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, scope]);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const hasQuery = query.trim().length >= MIN_QUERY_LENGTH;
  const moreIndex = results.length;
  const itemCount = results.length + (hasQuery ? 1 : 0);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open && hasQuery) setOpen(true);
      setActiveIndex((i) => (i + 1) % Math.max(itemCount, 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? itemCount - 1 : i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        goToItem(results[activeIndex]);
      } else {
        goToSearchPage(query);
      }
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full sm:max-w-md ${className ?? ""}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="media-search-listbox"
        aria-autocomplete="list"
        placeholder={placeholder ?? "Search..."}
        className="pl-9 pr-9 bg-card border-border/60 rounded-full text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => hasQuery && setOpen(true)}
        aria-label="Search"
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" />
        </span>
      )}

      {open && (results.length > 0 || hasQuery) && (
        <ul
          id="media-search-listbox"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/20 animate-dropdown-in"
        >
          {results.map((item, i) => (
            <li
              key={`${item.source}-${item.id}`}
              role="option"
              aria-selected={activeIndex === i}
              className="animate-item-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => goToItem(item)}
                className={`group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  activeIndex === i ? "bg-primary/10" : "hover:bg-muted/50"
                }`}
              >
                <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/20">
                  {item.posterUrl ? (
                    <Image src={item.posterUrl} alt="" fill sizes="44px" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{mediaTypeLabel(item)}</span>
                    {item.year > 0 && (<><span>•</span><span>{item.year}</span></>)}
                  </div>
                </div>
                {item.rating > 0 && (
                  <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-xs font-semibold">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    {item.rating.toFixed(1)}
                  </span>
                )}
              </button>
            </li>
          ))}

          {results.length === 0 && !loading && (
            <li className="px-3 py-4 text-center text-sm text-muted-foreground">
              {unavailable
                ? "Search is temporarily unavailable. Try again shortly."
                : `No matches for "${query.trim()}"`}
            </li>
          )}

          {hasQuery && !unavailable && (
            <li role="option" aria-selected={activeIndex === moreIndex}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(moreIndex)}
                onClick={() => goToSearchPage(query)}
                className={`group flex w-full items-center justify-between gap-2 border-t border-border/50 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeIndex === moreIndex ? "bg-primary/10 text-primary" : "text-primary hover:bg-muted/50"
                }`}
              >
                <span>All results for &ldquo;{query.trim()}&rdquo;</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
