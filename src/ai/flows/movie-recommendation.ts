/**
 * Movie Recommendation Flow
 *
 * Uses Tavily for real-time movie context and Gemini Flash-Lite
 * for intelligent selection. Caches responses by input to avoid
 * repeated API calls for the same mood/genre.
 */

import { ai, MODELS } from '@/ai/config';
import {
  RecommendMovieInputSchema,
  RecommendMovieOutputSchema,
  type RecommendMovieInput,
  type RecommendMovieOutput,
} from '@/ai/types';
import { searchMoviesByGenre } from '@/ai/services/tavily';
import { recommendationCache } from '@/ai/services/recommendation-cache';
import { recommendationResponseCache, ONE_HOUR } from '@/ai/services/cache';
import { buildRecommendationPrompt } from '@/ai/utils/prompt-builder';

export type { RecommendMovieInput, RecommendMovieOutput };

export async function recommendMovie(input: RecommendMovieInput): Promise<RecommendMovieOutput> {
  return recommendMovieFlow(input);
}

const recommendMovieFlow = ai.defineFlow(
  {
    name: 'recommendMovieFlow',
    inputSchema: RecommendMovieInputSchema,
    outputSchema: RecommendMovieOutputSchema,
  },
  async (input) => {
    const cacheKey = input.moodOrGenre.toLowerCase().trim();

    // Check response cache first
    const cached = recommendationResponseCache.get(cacheKey);
    if (cached) {
      return cached as RecommendMovieOutput;
    }

    // Fetch context from Tavily (reduced to 5 results)
    const tavilyResults = await fetchMovieData(input.moodOrGenre);

    // Build prompt
    const prompt = buildRecommendationPrompt({
      tavilyResults,
      excludeList: recommendationCache.getRecentMovies(),
    });

    // Generate with fallback
    const output = await generateWithFallback(prompt, input);

    // Track in dedup cache
    recommendationCache.add(output.title, output.year);

    // Cache the full response for 1 hour
    recommendationResponseCache.set(cacheKey, output, ONE_HOUR);

    return output;
  }
);

async function fetchMovieData(moodOrGenre: string) {
  try {
    return await searchMoviesByGenre(moodOrGenre);
  } catch (error) {
    console.error('Tavily search failed, continuing without context:', error);
    return [];
  }
}

async function generateWithFallback(
  prompt: string,
  input: RecommendMovieInput
): Promise<RecommendMovieOutput> {
  // Try primary model first
  try {
    const promptFn = createPrompt(prompt, MODELS.PRIMARY);
    const result = await promptFn(input);
    if (result.output) return result.output;
  } catch (error: any) {
    console.error(`Primary model failed (${error.message}), trying fallback...`);
  }

  // Fallback to lite model
  const fallbackFn = createPrompt(prompt, MODELS.FALLBACK);
  const result = await fallbackFn(input);

  if (!result.output) {
    throw new Error('Failed to generate movie recommendation');
  }

  return result.output;
}

function createPrompt(prompt: string, model: string) {
  return ai.definePrompt({
    name: `movieRecommendation_${Date.now()}`,
    input: { schema: RecommendMovieInputSchema },
    output: { schema: RecommendMovieOutputSchema },
    prompt,
    model,
  });
}
