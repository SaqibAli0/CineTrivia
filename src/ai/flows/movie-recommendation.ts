/**
 * @fileOverview AI-powered movie recommendation flow.
 *
 * Uses Tavily Search API for real-time movie data and Gemini AI for intelligent selection.
 * Implements fallback mechanism from Gemini 2.5 Flash to Flash-Lite for reliability.
 */

import {ai, MODELS} from '@/ai/config';
import {
  RecommendMovieInputSchema,
  RecommendMovieOutputSchema,
  type RecommendMovieInput,
  type RecommendMovieOutput,
} from '@/ai/types';
import {searchMoviesByGenre} from '@/ai/services/tavily';
import {recommendationCache} from '@/ai/services/recommendation-cache';
import {buildRecommendationPrompt} from '@/ai/utils/prompt-builder';
import {z} from 'genkit';

export type {RecommendMovieInput, RecommendMovieOutput};

/**
 * Get movie recommendation based on mood or genre
 */
export async function recommendMovie(input: RecommendMovieInput): Promise<RecommendMovieOutput> {
  return recommendMovieFlow(input);
}

// Flow definition
const recommendMovieFlow = ai.defineFlow(
  {
    name: 'recommendMovieFlow',
    inputSchema: RecommendMovieInputSchema,
    outputSchema: RecommendMovieOutputSchema,
  },
  async (input) => {
    // Fetch real movie data from Tavily
    const tavilyResults = await fetchMovieData(input.moodOrGenre);

    // Build prompt with context
    const prompt = buildRecommendationPrompt({
      tavilyResults,
      excludeList: recommendationCache.getRecentMovies(),
    });

    // Generate recommendation with fallback
    const output = await generateWithFallback(prompt, input);

    // Cache the recommendation
    if (output) {
      recommendationCache.add(output.title, output.year);
      console.log(`Recommendation cached. Total tracked: ${recommendationCache.getSize()}`);
    }

    return output;
  }
);

/**
 * Fetch movie data from Tavily Search API
 */
async function fetchMovieData(moodOrGenre: string) {
  try {
    return await searchMoviesByGenre(moodOrGenre);
  } catch (error) {
    console.log('Tavily search failed, proceeding with Gemini only:', error);
    return [];
  }
}

/**
 * Generate recommendation with primary model, fallback to lite if needed
 */
async function generateWithFallback(prompt: string, input: RecommendMovieInput): Promise<RecommendMovieOutput> {
  // Try primary model first
  try {
    const promptFn = createPromptFunction(prompt, MODELS.PRIMARY);
    const result = await promptFn(input);
    
    if (result.output) {
      console.log(`Generated with ${MODELS.PRIMARY}:`, result.output.title);
      return result.output;
    }
  } catch (error: any) {
    console.log(`Primary model failed (${error.message}), using fallback...`);
  }

  // Fallback to lite model
  const fallbackPromptFn = createPromptFunction(prompt, MODELS.FALLBACK);
  const result = await fallbackPromptFn(input);

  if (!result.output) {
    throw new Error('Failed to generate movie recommendation');
  }

  console.log(`Generated with ${MODELS.FALLBACK} (fallback):`, result.output.title);
  return result.output;
}

/**
 * Create a prompt function with specific model
 */
function createPromptFunction(prompt: string, model: string) {
  return ai.definePrompt({
    name: `movieRecommendation_${Date.now()}`,
    input: {schema: RecommendMovieInputSchema},
    output: {schema: RecommendMovieOutputSchema},
    prompt,
    model,
  });
}
