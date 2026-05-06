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
  movieTitle: z.string().describe('The title of the movie.'),
  skipCache: z.boolean().optional().describe('If true, generate a fresh fact instead of returning cached.'),
});
export type MovieFunFactInput = z.infer<typeof MovieFunFactInputSchema>;

const MovieFunFactOutputSchema = z.object({
  funFact: z.string().describe('An interesting fun fact about the movie.'),
});
export type MovieFunFactOutput = z.infer<typeof MovieFunFactOutputSchema>;

export async function movieFunFact(input: MovieFunFactInput): Promise<MovieFunFactOutput> {
  return movieFunFactFlow(input);
}

const primaryPrompt = ai.definePrompt({
  name: 'movieFunFactPrompt',
  input: { schema: MovieFunFactInputSchema },
  output: { schema: MovieFunFactOutputSchema },
  model: MODELS.PRIMARY,
  prompt: `You are a movie trivia expert. Generate one interesting and relevant fun fact or behind-the-scenes trivia about the movie "{{{movieTitle}}}". Keep it concise — two to three sentences max.`,
});

const fallbackPrompt = ai.definePrompt({
  name: 'movieFunFactFallbackPrompt',
  input: { schema: MovieFunFactInputSchema },
  output: { schema: MovieFunFactOutputSchema },
  model: MODELS.FALLBACK,
  prompt: `You are a movie trivia expert. Generate one interesting and relevant fun fact or behind-the-scenes trivia about the movie "{{{movieTitle}}}". Keep it concise — two to three sentences max.`,
});

const movieFunFactFlow = ai.defineFlow(
  {
    name: 'movieFunFactFlow',
    inputSchema: MovieFunFactInputSchema,
    outputSchema: MovieFunFactOutputSchema,
  },
  async (input) => {
    const cacheKey = input.movieTitle.toLowerCase().trim();

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
