"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getMovieRecommendation, getMoviePoster } from "@/app/actions";
import type { RecommendMovieOutput } from "@/ai/flows/movie-recommendation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { StarRating } from "./star-rating";

const formSchema = z.object({
  genres: z.array(z.string()).optional(),
  mood: z.string().optional(),
}).refine(data => (data.genres && data.genres.length > 0) || !!data.mood, {
  message: "Please select at least one genre or a mood.",
  path: ["genres"],
});

const genres = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"];
const moods = ["Heartwarming", "Exciting", "Funny", "Intense", "Sad", "Thought-provoking", "Suspenseful", "Relaxing"];

export function MovieRecommendation() {
  const [recommendation, setRecommendation] = useState<RecommendMovieOutput | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [isPosterLoading, setIsPosterLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genres: [],
      mood: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);
    setPosterUrl("");
    try {
      let inputText = "";
      const genreText = values.genres && values.genres.length > 0 ? values.genres.join(' ') : "";

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
        const posterResult = await getMoviePoster({
          title: result.title,
          description: result.description,
          genre: result.genre,
        });
        if (posterResult.posterDataUri) {
          setPosterUrl(posterResult.posterDataUri);
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

  return (
    <section aria-labelledby="recommendation-heading">
      <Card className="bg-accent/20 border-accent/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary"/>
            <CardTitle id="recommendation-heading" className="text-2xl">Movie Recommendation AI</CardTitle>
          </div>
          <CardDescription>
            Tell me what you're in the mood for, and I'll suggest a movie.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="genres"
                render={() => (
                  <FormItem>
                    <FormLabel>Genres</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                      {genres.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="genres"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value ?? []), item])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mood" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {moods.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
               <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Recommendation
              </Button>

              {isLoading && !recommendation && (
                <div className="mt-4 p-4 flex items-center justify-center w-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4 text-muted-foreground">Thinking of a great movie for you...</p>
                </div>
              )}

              {recommendation && (
                <Card className="mt-4 w-full overflow-hidden bg-background/50">
                  <CardContent className="p-0 md:flex md:items-start md:gap-6">
                    <div className="md:w-1/3 aspect-[2/3] relative w-full shrink-0">
                      {isPosterLoading ? (
                        <Skeleton className="h-full w-full" />
                      ) : (
                        <Image
                          src={posterUrl}
                          alt={`Poster for ${recommendation.title}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          data-ai-hint={`${recommendation.genre} movie poster`}
                        />
                      )}
                    </div>
                    <div className="p-6 md:w-2/3">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle>{recommendation.title} ({recommendation.year})</CardTitle>
                        <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{recommendation.genre}</Badge>
                          <Badge variant="secondary">{recommendation.ageRating}</Badge>
                        </div>
                      </CardHeader>
                      <CardDescription className="mb-4">{recommendation.description}</CardDescription>
                      <div className="flex items-center gap-4">
                        <StarRating initialRating={Math.round(recommendation.rating / 2)} onRate={() => {}} />
                        <span className="font-bold text-lg text-primary">{recommendation.rating.toFixed(1)}/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </section>
  );
}
