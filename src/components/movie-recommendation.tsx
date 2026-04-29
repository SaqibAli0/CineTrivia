"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getMovieRecommendation, getMoviePoster } from "@/app/actions";
import type { RecommendMovieOutput } from "@/ai/flows/movie-recommendation";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, ImageIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { StarRating } from "./star-rating";
import { FunFactButton } from "./fun-fact-button";
import { getPoster, savePoster } from "@/lib/indexeddb-poster";

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
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [isPosterLoading, setIsPosterLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genres: [],
      mood: undefined,
    },
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
    setIsLoading(true);
    setRecommendation(null);
    setPosterUrl("");
    try {
      let inputText = "";
      const genreText = values.genres && values.genres.length > 0 ? values.genres.join(" ") : "";
      if (values.mood && genreText) {
        inputText = `a ${values.mood.toLowerCase()} ${genreText.toLowerCase()} movie`;
      } else if (values.mood) {
        inputText = `a ${values.mood.toLowerCase()} movie`;
      } else if (genreText) {
        inputText = `a ${genreText.toLowerCase()} movie`;
      }

      const result = await getMovieRecommendation({ moodOrGenre: inputText });
      setRecommendation(result);

      setIsPosterLoading(true);
      try {
        // Check IndexedDB first
        const cachedPoster = await getPoster(result.title);
        if (cachedPoster) {
          setPosterUrl(cachedPoster);
          return;
        }

        // Not in cache, fetch from API
        const posterResult = await getMoviePoster({
          title: result.title,
          description: result.description,
          genre: result.genre,
        });
        if (posterResult.posterDataUri) {
          setPosterUrl(posterResult.posterDataUri);
          // Save to IndexedDB for future use
          await savePoster(result.title, posterResult.posterDataUri);
        }
      } catch (e) {
        console.error("Failed to generate poster for recommendation", e);
        setPosterUrl("https://placehold.co/500x750.png");
      } finally {
        setIsPosterLoading(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get recommendation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const displayRating = recommendation ? Math.round((recommendation.rating || 0) / 2) : 0;

  return (
    <section className="py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1]">
              Discover Your Next Favorite Film
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
              Select genres and a mood, and our cinematic intelligence will curate the perfect viewing experience.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Genres */}
              <FormField
                control={form.control}
                name="genres"
                render={() => (
                  <FormItem>
                    <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-3">
                      Genres
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => {
                        const active = selectedGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => toggleGenre(genre)}
                            className={`px-4 py-1.5 rounded-full border text-sm transition-colors flex items-center gap-1.5 ${
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

              {/* Moods */}
              <FormField
                control={form.control}
                name="mood"
                render={() => (
                  <FormItem>
                    <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-3">
                      Mood
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((mood) => {
                        const active = selectedMood === mood;
                        return (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => selectMood(mood)}
                            className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
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

              <Button
                type="submit"
                disabled={isLoading || (!selectedGenres.length && !selectedMood)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 h-auto text-sm font-medium"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Recommendation
              </Button>
            </form>
          </Form>
        </div>

        {/* Right Column */}
        <div className="min-h-[320px]">
          {isLoading && !recommendation && (
            <div className="bg-[hsl(var(--rec-surface))] rounded-[2rem] p-6 md:p-8 h-full flex flex-col items-center justify-center min-h-[320px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-[hsl(var(--rec-muted))] text-sm">Thinking of a great movie for you...</p>
            </div>
          )}

          {recommendation && (
            <Dialog>
              <div className="bg-[hsl(var(--rec-surface))] rounded-[2rem] p-6 md:p-8 relative">
                <div className="mb-4">
                  <p className="text-[11px] tracking-widest uppercase text-[hsl(var(--rec-muted))]">
                    Recommended
                  </p>
                </div>

                {/* Top row: Image + Title + Meta */}
                <div className="flex gap-5 items-start">
                  {/* Image - 1/4 width */}
                  <div className="w-1/4 shrink-0 aspect-[2/3] relative rounded-xl bg-[hsl(var(--rec-border))] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-[hsl(var(--rec-muted))] opacity-40" />
                    </div>
                    {isPosterLoading ? (
                      <Skeleton className="absolute inset-0" />
                    ) : posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={recommendation.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  {/* Title + Meta to the right */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center self-center">
                    <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl text-[hsl(var(--rec-text))] leading-[1.05] mb-4 tracking-tight">
                      {recommendation.title}
                    </h2>
                    <div className="flex items-center gap-3 text-[11px] tracking-widest uppercase text-[hsl(var(--rec-muted))]">
                      <span>{recommendation.year}</span>
                      <span>•</span>
                      <span>{recommendation.genre}</span>
                      <span>•</span>
                      <span>{(recommendation as any).ageRating || "PG-13"}</span>
                    </div>
                  </div>
                </div>

                {/* Description below */}
                <div className="mt-5">
                  <p className="text-sm md:text-base text-[hsl(var(--rec-muted))] leading-relaxed mb-5 line-clamp-4">
                    {recommendation.description}
                  </p>

                  <div className="flex items-center gap-4">
                    <DialogTrigger asChild>
                      <Button className="bg-[hsl(var(--rec-text))] text-[hsl(var(--rec-surface))] hover:bg-[hsl(var(--rec-text))]/80 rounded-full px-5 py-2.5 h-auto text-sm font-medium">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <span className="text-sm font-semibold text-[hsl(var(--rec-text))]">
                      {recommendation.rating ? `${recommendation.rating.toFixed(1)}` : "8.5"}
                      <span className="text-[hsl(var(--rec-muted))] font-normal"> /10</span>
                    </span>
                  </div>
                </div>
              </div>

              <DialogContent className="sm:max-w-3xl grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 p-0 overflow-hidden rounded-[2rem] border-0 bg-card">
                <div className="aspect-[2/3] relative w-full overflow-hidden bg-muted">
                  {isPosterLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <Image
                      src={posterUrl || "https://placehold.co/500x750.png"}
                      alt={`Poster for ${recommendation.title}`}
                      fill
                      sizes="(max-width: 768px) 90vw, 40vw"
                      className="object-cover"
                      data-ai-hint={`${recommendation.genre} movie poster`}
                    />
                  )}
                </div>
                <div className="flex flex-col p-8 md:pl-0 md:py-8 md:pr-8">
                  <DialogHeader className="text-left space-y-0 gap-0 mb-6">
                    <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-3">
                      {recommendation.year} &nbsp;&bull;&nbsp; {recommendation.genre} &nbsp;&bull;&nbsp; {(recommendation as any).ageRating || "PG-13"}
                    </p>
                    <DialogTitle className="font-headline text-3xl md:text-4xl mb-3 leading-tight">
                      {recommendation.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm md:text-base leading-relaxed text-muted-foreground">
                      {recommendation.description}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex items-center gap-5 mb-8">
                    <StarRating initialRating={displayRating} onRate={setRating} totalStars={5} />
                    <div className="h-4 w-px bg-border" />
                    <span className="font-bold text-lg text-primary">
                      {recommendation.rating ? recommendation.rating.toFixed(1) : "8.5"}<span className="text-muted-foreground font-normal">/10</span>
                    </span>
                  </div>

                  <div className="mt-auto flex justify-start pt-6 border-t border-border/40">
                    <FunFactButton movieTitle={recommendation.title} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </section>
  );
}
