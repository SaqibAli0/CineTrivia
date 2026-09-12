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
import { verifyMovie } from '@/lib/tmdb';
import { TMDBUnreachableError } from '@/lib/tmdb-client';

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

    // Generate, then (best-effort) validate against TMDB. Retry once if the
    // first pick can't be verified as a REAL movie (likely a hallucination),
    // excluding it the second time.
    //
    // Important: if TMDB is unreachable, we do NOT treat that as "unverified".
    // Verification is a best-effort enrichment — when the network is down we
    // keep the AI's original pick as-is, so we never swap a correct, on-genre
    // recommendation for a worse fallback just because we couldn't reach TMDB.
    let output: RecommendMovieOutput | null = null;

    for (let attempt = 0; attempt < 2 && !output; attempt++) {
      const prompt = buildRecommendationPrompt({
        tavilyResults,
        excludeList: recommendationCache.getRecentMovies(),
      });

      const candidate = await generateWithFallback(prompt, input);

      let verified: Awaited<ReturnType<typeof verifyMovie>> = null;
      let verificationSkipped = false;
      try {
        verified = await verifyMovie(candidate.title, candidate.year);
      } catch (error) {
        // TMDB unreachable — skip verification, trust the AI's pick.
        if (error instanceof TMDBUnreachableError) {
          verificationSkipped = true;
        } else {
          throw error;
        }
      }

      if (verified) {
        // Correct any hallucinated year/rating and enrich with real TMDB data.
        output = {
          ...candidate,
          title: verified.title,
          year: verified.year,
          rating: verified.rating > 0 ? verified.rating : candidate.rating,
          genre: candidate.genre || verified.genre,
          description: candidate.description || verified.overview,
        };
      } else if (verificationSkipped) {
        // Couldn't verify due to network — accept the AI's original pick.
        output = candidate;
      } else {
        // Verified as NOT a real movie (hallucination) — remember + retry.
        recommendationCache.add(candidate.title, candidate.year);
        if (attempt === 1) output = candidate; // final fallback
      }
    }

    if (!output) {
      throw new Error('Failed to generate a verifiable movie recommendation');
    }

    // Track in dedup cache so subsequent requests rotate to a different film.
    recommendationCache.add(output.title, output.year);

    // Cache the full response for 1 hour to stay zero-cost.
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
