/**
 * Movie Fun Fact Flow
 *
 * Generates trivia about a movie using Gemini.
 * Primary model with fallback if it fails.
 * Results are cached by movie title so repeated requests
 * for the same movie don't cost anything.
 */

import { ai, MODELS } from '@/ai/config';
import { z } from 'genkit';
import { funFactCache } from '@/ai/services/cache';

const MovieFunFactInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie/show.'),
  skipCache: z.boolean().optional().describe('If true, generate a fresh fact instead of returning cached.'),
  mediaType: z.enum(['movie', 'tv', 'animation']).optional().describe(
    "What kind of title this is: 'movie' (default), 'tv', or 'animation'."
  ),
});
export type MovieFunFactInput = z.infer<typeof MovieFunFactInputSchema>;

const MovieFunFactOutputSchema = z.object({
  funFact: z.string().describe('An interesting fun fact about the movie.'),
});
export type MovieFunFactOutput = z.infer<typeof MovieFunFactOutputSchema>;

export async function movieFunFact(input: MovieFunFactInput): Promise<MovieFunFactOutput> {
  return movieFunFactFlow(input);
}

// Neutral wording ("title") so the same prompt works for movies, TV shows,
// and animated titles without a separate prompt per media type.
const FUN_FACT_PROMPT = `You are an entertainment trivia expert. Generate one interesting and relevant fun fact or behind-the-scenes trivia about the title "{{{movieTitle}}}" (a movie, TV show, or animated production). Keep it concise — two to three sentences max.`;

const primaryPrompt = ai.definePrompt({
  name: 'movieFunFactPrompt',
  input: { schema: MovieFunFactInputSchema },
  output: { schema: MovieFunFactOutputSchema },
  model: MODELS.PRIMARY,
  prompt: FUN_FACT_PROMPT,
});

const fallbackPrompt = ai.definePrompt({
  name: 'movieFunFactFallbackPrompt',
  input: { schema: MovieFunFactInputSchema },
  output: { schema: MovieFunFactOutputSchema },
  model: MODELS.FALLBACK,
  prompt: FUN_FACT_PROMPT,
});

const movieFunFactFlow = ai.defineFlow(
  {
    name: 'movieFunFactFlow',
    inputSchema: MovieFunFactInputSchema,
    outputSchema: MovieFunFactOutputSchema,
  },
  async (input) => {
    const cacheKey = `${input.mediaType ?? 'movie'}|${input.movieTitle.toLowerCase().trim()}`;

    // Return cached fact unless caller wants a fresh one
    if (!input.skipCache) {
      const cached = funFactCache.get(cacheKey);
      if (cached) {
        return { funFact: cached };
      }
    }

    // Try primary model
    try {
      const { output } = await primaryPrompt(input);
      if (output?.funFact) {
        funFactCache.set(cacheKey, output.funFact);
        return output;
      }
    } catch (error: any) {
      console.error(`Fun fact primary model failed (${error.message}), trying fallback...`);
    }

    // Fallback model
    const { output } = await fallbackPrompt(input);
    const fact = output!.funFact;

    funFactCache.set(cacheKey, fact);
    return { funFact: fact };
  }
);
