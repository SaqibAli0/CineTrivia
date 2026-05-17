"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getMovieRecommendation, getMoviePoster } from "@/app/actions";
import type { RecommendMovieOutput } from "@/ai/types";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ImageIcon, Check, History, X } from "lucide-react";
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

  useEffect(() => { setHistory(getHistory()); }, []);

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
      if (values.mood && genreText) inputText = `a ${values.mood.toLowerCase()} ${genreText.toLowerCase()} movie`;
      else if (values.mood) inputText = `a ${values.mood.toLowerCase()} movie`;
      else if (genreText) inputText = `a ${genreText.toLowerCase()} movie`;

      const result = await getMovieRecommendation({ moodOrGenre: inputText });
      setRecommendation(result);

      setIsPosterLoading(true);
      getMoviePoster({ title: result.title, description: result.description, genre: result.genre })
        .then((res) => {
          if (res.posterDataUri) {
            setPosterUrl(res.posterDataUri);
            addToHistory({ title: result.title, year: result.year, genre: result.genre, description: result.description, rating: result.rating, ageRating: result.ageRating, posterUrl: res.posterDataUri });
            setHistory(getHistory());
          }
        })
        .catch(() => {
          addToHistory({ title: result.title, year: result.year, genre: result.genre, description: result.description, rating: result.rating, ageRating: result.ageRating, posterUrl: "" });
          setHistory(getHistory());
        })
        .finally(() => setIsPosterLoading(false));
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to get recommendation." });
    } finally {
      setIsLoading(false);
      pendingRef.current = false;
    }
  }

  function loadFromHistory(entry: HistoryEntry) {
    setRecommendation({ title: entry.title, year: entry.year, genre: entry.genre, description: entry.description, rating: entry.rating, ageRating: entry.ageRating });
    setPosterUrl(entry.posterUrl);
    setShowHistory(false);
  }

  return (
    <section className="flex flex-col pb-2">
      {/* Header */}
      <div className="spec-card flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-bordercolor flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display-font text-2xl sm:text-3xl md:text-4xl text-parchment">Recommendation Engine</h2>
            <div className="mono-font text-terracotta mt-1">Personalized picks, just for you</div>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="border border-bordercolor text-parchment/60 mono-font px-4 py-2 hover:border-terracotta hover:text-terracotta transition-colors flex items-center gap-2 shrink-0"
            >
              <History className="w-3.5 h-3.5" />
              Log
            </button>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-bordercolor">
          {/* Left: Form */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
            <p className="mono-font text-parchment/70 leading-relaxed text-[11px] mb-8 max-w-lg">
              Select your preferred genres and mood to get a personalized movie recommendation.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="genres"
                  render={() => (
                    <FormItem>
                      <p className="mono-font text-terracotta mb-3">Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => {
                          const active = selectedGenres.includes(genre);
                          return (
                            <button
                              key={genre}
                              type="button"
                              onClick={() => toggleGenre(genre)}
                              className={`px-3 py-1.5 border mono-font transition-all flex items-center gap-1.5 ${
                                active
                                  ? "bg-terracotta/10 border-terracotta text-terracotta"
                                  : "border-bordercolor text-parchment/60 hover:text-parchment hover:border-parchment/40"
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
                      <p className="mono-font text-terracotta mb-3">Mood</p>
                      <div className="flex flex-wrap gap-2">
                        {moods.map((mood) => {
                          const active = selectedMood === mood;
                          return (
                            <button
                              key={mood}
                              type="button"
                              onClick={() => selectMood(mood)}
                              className={`px-3 py-1.5 border mono-font transition-all ${
                                active
                                  ? "bg-terracotta/10 border-terracotta text-terracotta"
                                  : "border-bordercolor text-parchment/60 hover:text-parchment hover:border-parchment/40"
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

                <button
                  type="submit"
                  disabled={isLoading || (!selectedGenres.length && !selectedMood)}
                  className="bg-terracotta text-charcoal mono-font px-6 py-3 hover:bg-terracotta/90 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>▶</span>
                  )}
                  Get Recommendation
                </button>
              </form>
            </Form>
          </div>

          {/* Right: Result */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center items-center min-h-[350px]">
            {showHistory && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <p className="mono-font text-terracotta">History</p>
                  <button onClick={() => setShowHistory(false)} className="text-parchment/50 hover:text-parchment transition-colors" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {history.map((entry, i) => (
                    <button
                      key={`${entry.title}-${i}`}
                      onClick={() => loadFromHistory(entry)}
                      className="w-full text-left flex items-center gap-3 p-3 border border-transparent hover:border-bordercolor transition-colors"
                    >
                      <div className="w-10 h-14 shrink-0 bg-black/30 overflow-hidden relative border border-bordercolor">
                        {entry.posterUrl ? (
                          <Image src={entry.posterUrl} alt={entry.title} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="w-3 h-3 text-parchment/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="mono-font text-parchment truncate">{entry.title}</p>
                        <p className="mono-font text-parchment/50 text-[9px]">{entry.year} • {entry.genre}</p>
                      </div>
                      <span className="mono-font text-terracotta text-[9px]">{entry.rating.toFixed(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && !recommendation && !showHistory && (
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-terracotta mx-auto mb-4" />
                <p className="mono-font text-parchment/60">Finding your movie...</p>
              </div>
            )}

            {recommendation && !showHistory && (
              <div className="w-full">
                <p className="mono-font text-terracotta mb-6">Here&apos;s your match</p>
                <div className="flex gap-5 items-start">
                  <div className="w-28 sm:w-32 shrink-0 aspect-[2/3] relative bg-black/30 border border-bordercolor overflow-hidden">
                    {isPosterLoading ? (
                      <Skeleton className="absolute inset-0 rounded-none" />
                    ) : posterUrl ? (
                      <Image src={posterUrl} alt={recommendation.title} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-parchment/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="display-font text-3xl sm:text-4xl text-parchment mb-2">
                      {recommendation.title}
                    </h3>
                    <div className="mono-font text-parchment/50 mb-4 flex flex-wrap gap-x-3 gap-y-1">
                      <span>{recommendation.year}</span>
                      <span className="text-parchment/20">|</span>
                      <span>{recommendation.genre}</span>
                      <span className="text-parchment/20">|</span>
                      <span className="text-terracotta">R // {recommendation.rating?.toFixed(1) || "8.5"}</span>
                    </div>
                    <p className="mono-font text-parchment/70 text-[11px] leading-relaxed line-clamp-4 mb-6">
                      {recommendation.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/movie/${toSlug(recommendation.title, recommendation.year)}`}
                        className="border border-terracotta text-terracotta mono-font px-5 py-2.5 hover:bg-terracotta hover:text-charcoal transition-colors"
                      >
                        View Details
                      </Link>
                      <FunFactButton movieTitle={recommendation.title} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !recommendation && !showHistory && (
              <div className="text-center">
                <div className="w-16 h-16 border border-bordercolor flex items-center justify-center mx-auto mb-4">
                  <span className="display-font text-2xl text-parchment/30">?</span>
                </div>
                <p className="mono-font text-parchment/60 mb-1">Pick your mood and genres</p>
                <p className="mono-font text-parchment/30 text-[9px]">Then hit Get Recommendation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
