"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getMovieRecommendation, getMoviePoster } from "@/app/actions";
import type { RecommendMovieOutput } from "@/ai/types";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles, ImageIcon, Check, History, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FunFactButton } from "./fun-fact-button";
import { getHistory, addToHistory, type HistoryEntry } from "@/lib/history";
import { toSlug } from "@/lib/slug";
import Link from "next/link";

const formSchema = z.object({
  genres: z.array(z.string()).optional(),
  mood: z.string().optional(),
}).refine(
  (data) => (data.genres && data.genres.length > 0) || !!data.mood,
  { message: "Please select at least one genre or a mood.", path: ["genres"] }
);

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Drama",
  "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western",
];

const moods = [
  "Heartwarming", "Exciting", "Funny", "Intense", "Sad",
  "Thought-provoking", "Suspenseful", "Relaxing",
];

export function MovieRecommendation() {
  const [recommendation, setRecommendation] = useState<RecommendMovieOutput | null>(null);
  const [posterUrl, setPosterUrl] = useState("");
  const [isPosterLoading, setIsPosterLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { toast } = useToast();

  const pendingRef = useRef(false);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { genres: [], mood: undefined },
  });

  const selectedGenres = form.watch("genres") || [];
  const selectedMood = form.watch("mood");

  function toggleGenre(genre: string) {
    const current = form.getValues("genres") || [];
    if (current.includes(genre)) {
      form.setValue("genres", current.filter((g) => g !== genre), { shouldValidate: true });
    } else {
      form.setValue("genres", [...current, genre], { shouldValidate: true });
    }
  }

  function selectMood(mood: string) {
    const current = form.getValues("mood");
    form.setValue("mood", current === mood ? undefined : mood, { shouldValidate: true });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (pendingRef.current) return;
    pendingRef.current = true;

    setIsLoading(true);
    setRecommendation(null);
    setPosterUrl("");
    setShowHistory(false);

    try {
      let inputText = "";
      const genreText = values.genres?.length ? values.genres.join(" ") : "";

      if (values.mood && genreText) {
        inputText = `a ${values.mood.toLowerCase()} ${genreText.toLowerCase()} movie`;
      } else if (values.mood) {
        inputText = `a ${values.mood.toLowerCase()} movie`;
      } else if (genreText) {
        inputText = `a ${genreText.toLowerCase()} movie`;
      }

      const result = await getMovieRecommendation({ moodOrGenre: inputText });
      setRecommendation(result);

      // Load poster in background
      setIsPosterLoading(true);
      getMoviePoster({
        title: result.title,
        description: result.description,
        genre: result.genre,
      })
        .then((res) => {
          if (res.posterDataUri) {
            setPosterUrl(res.posterDataUri);
            // Save to history with poster
            addToHistory({
              title: result.title,
              year: result.year,
              genre: result.genre,
              description: result.description,
              rating: result.rating,
              ageRating: result.ageRating,
              posterUrl: res.posterDataUri,
            });
            setHistory(getHistory());
          }
        })
        .catch(() => {
          // Save to history without poster
          addToHistory({
            title: result.title,
            year: result.year,
            genre: result.genre,
            description: result.description,
            rating: result.rating,
            ageRating: result.ageRating,
            posterUrl: "",
          });
          setHistory(getHistory());
        })
        .finally(() => setIsPosterLoading(false));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get recommendation. Please try again.",
      });
    } finally {
      setIsLoading(false);
      pendingRef.current = false;
    }
  }

  function loadFromHistory(entry: HistoryEntry) {
    setRecommendation({
      title: entry.title,
      year: entry.year,
      genre: entry.genre,
      description: entry.description,
      rating: entry.rating,
      ageRating: entry.ageRating,
    });
    setPosterUrl(entry.posterUrl);
    setShowHistory(false);
  }

  return (
    <section className="pt-6 sm:pt-8 md:pt-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Left: Form */}
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1]">
              Discover Your Next Favorite Film
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-md leading-relaxed">
              Select genres and a mood, and our cinematic intelligence will curate the perfect viewing experience.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <FormField
                control={form.control}
                name="genres"
                render={() => (
                  <FormItem>
                    <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2 sm:mb-3">Genres</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {genres.map((genre) => {
                        const active = selectedGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => toggleGenre(genre)}
                            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-1.5 ${
                              active
                                ? "bg-primary/10 border-primary text-primary"
                                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/40"
                            }`}
                          >
                            {active && <Check className="w-3 h-3" />}
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mood"
                render={() => (
                  <FormItem>
                    <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2 sm:mb-3">Mood</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {moods.map((mood) => {
                        const active = selectedMood === mood;
                        return (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => selectMood(mood)}
                            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm transition-colors ${
                              active
                                ? "bg-primary/10 border-primary text-primary"
                                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/40"
                            }`}
                          >
                            {mood}
                          </button>
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || (!selectedGenres.length && !selectedMood)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 h-auto text-xs sm:text-sm font-medium"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Get Recommendation
                </Button>

                {history.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    className="rounded-full px-4 py-2.5 sm:py-3 h-auto text-xs sm:text-sm"
                  >
                    <History className="mr-2 h-4 w-4" />
                    History
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Right: Result or History */}
        <div className="min-h-0 lg:min-h-[320px]">
          {/* History panel */}
          {showHistory && (
            <div className="bg-[hsl(var(--rec-surface))] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <p className="text-[11px] tracking-widest uppercase text-[hsl(var(--rec-muted))]">
                  Past Recommendations
                </p>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-[hsl(var(--rec-muted))] hover:text-[hsl(var(--rec-text))] transition-colors"
                  aria-label="Close history"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3 max-h-[350px] sm:max-h-[400px] overflow-y-auto">
                {history.map((entry, i) => (
                  <button
                    key={`${entry.title}-${i}`}
                    onClick={() => loadFromHistory(entry)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--rec-border))] transition-colors"
                  >
                    <div className="w-10 h-14 shrink-0 rounded-lg bg-[hsl(var(--rec-border))] overflow-hidden relative">
                      {entry.posterUrl ? (
                        <Image src={entry.posterUrl} alt={entry.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-[hsl(var(--rec-muted))] opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--rec-text))] truncate">{entry.title}</p>
                      <p className="text-xs text-[hsl(var(--rec-muted))]">{entry.year} • {entry.genre}</p>
                    </div>
                    <span className="text-xs font-medium text-[hsl(var(--rec-text))]">{entry.rating.toFixed(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && !recommendation && !showHistory && (
            <div className="bg-[hsl(var(--rec-surface))] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 h-full flex flex-col items-center justify-center min-h-[240px] sm:min-h-[320px]">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mb-3" />
              <p className="text-[hsl(var(--rec-muted))] text-xs sm:text-sm">Finding a great movie for you...</p>
            </div>
          )}

          {/* Recommendation result */}
          {recommendation && !showHistory && (
            <div className="bg-[hsl(var(--rec-surface))] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 relative">
              <div className="mb-3 sm:mb-4">
                <p className="text-[11px] tracking-widest uppercase text-[hsl(var(--rec-muted))]">Recommended</p>
              </div>

              <div className="flex gap-3 sm:gap-5 items-start">
                <div className="w-1/4 shrink-0 aspect-[2/3] relative rounded-lg sm:rounded-xl bg-[hsl(var(--rec-border))] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 sm:w-8 sm:h-8 text-[hsl(var(--rec-muted))] opacity-40" />
                  </div>
                  {isPosterLoading ? (
                    <Skeleton className="absolute inset-0" />
                  ) : posterUrl ? (
                    <Image src={posterUrl} alt={recommendation.title} fill className="object-cover" />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center self-center">
                  <h2 className="font-headline text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[hsl(var(--rec-text))] leading-[1.05] mb-2 sm:mb-4 tracking-tight">
                    {recommendation.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-[11px] tracking-widest uppercase text-[hsl(var(--rec-muted))]">
                    <span>{recommendation.year}</span>
                    <span>•</span>
                    <span>{recommendation.genre}</span>
                    <span>•</span>
                    <span>{recommendation.ageRating || "PG-13"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <p className="text-xs sm:text-sm md:text-base text-[hsl(var(--rec-muted))] leading-relaxed mb-4 sm:mb-5 line-clamp-3 sm:line-clamp-4">
                  {recommendation.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link href={`/movie/${toSlug(recommendation.title, recommendation.year)}`}>
                    <Button className="bg-[hsl(var(--rec-text))] text-[hsl(var(--rec-surface))] hover:bg-[hsl(var(--rec-text))]/80 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 h-auto text-xs sm:text-sm font-medium">
                      View Details
                    </Button>
                  </Link>
                  <FunFactButton movieTitle={recommendation.title} />
                  <span className="text-xs sm:text-sm font-semibold text-[hsl(var(--rec-text))]">
                    {recommendation.rating?.toFixed(1) || "8.5"}
                    <span className="text-[hsl(var(--rec-muted))] font-normal"> /10</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
