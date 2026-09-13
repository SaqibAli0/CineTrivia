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
import { buildRecommendationPrompt } from '@/ai/utils/prompt-builder';
import { verifyMovie } from '@/lib/tmdb';
import { TMDBUnreachableError } from '@/lib/tmdb-client';
import { verifyShow } from '@/lib/tvmaze';
import { TVmazeUnreachableError } from '@/lib/tvmaze-client';

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
    const mediaType = input.mediaType ?? 'movie';

    // NOTE: We intentionally do NOT return a cached response for the same
    // mood/genre. The whole point of "get a recommendation" is that clicking
    // again gives a DIFFERENT pick when the user didn't like the last one.
    // Variety comes from `recommendationCache` (the exclude list) which tells
    // the model not to repeat recent picks; abuse is bounded by the per-minute
    // rate limiter in src/app/actions.ts, so dropping the response cache stays
    // zero-cost while making repeat clicks feel fresh.

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
        mediaType,
      });

      const candidate = await generateWithFallback(prompt, input);

      // Verify against the RIGHT source: movies → TMDB, tv/animation → TVmaze.
      // For 'animation' the pick may be an animated FILM (TMDB) or an animated
      // SERIES (TVmaze), so try TVmaze first (as an animation) and fall back to
      // TMDB when there's no animated-series match.
      let verified:
        | { title: string; year: number; rating: number; genre: string; overview: string; posterUrl: string }
        | null = null;
      let verificationSkipped = false;

      try {
        if (mediaType === 'tv') {
          verified = await verifyShow(candidate.title, candidate.year);
        } else if (mediaType === 'animation') {
          const asSeries = await verifyShow(candidate.title, candidate.year, true);
          verified = asSeries ?? (await verifyMovie(candidate.title, candidate.year));
        } else {
          verified = await verifyMovie(candidate.title, candidate.year);
        }
      } catch (error) {
        // Either source unreachable — skip verification, trust the AI's pick.
        if (error instanceof TMDBUnreachableError || error instanceof TVmazeUnreachableError) {
          verificationSkipped = true;
        } else {
          throw error;
        }
      }

      if (verified) {
        // Correct any hallucinated year/rating and enrich with real data,
        // including the REAL poster from the correct source (TVmaze for
        // tv/anime, TMDB for movies) so the card never shows a wrong poster.
        output = {
          ...candidate,
          title: verified.title,
          year: verified.year,
          rating: verified.rating > 0 ? verified.rating : candidate.rating,
          genre: candidate.genre || verified.genre,
          description: candidate.description || verified.overview,
          posterUrl: verified.posterUrl || undefined,
        };
      } else if (verificationSkipped) {
        // Couldn't verify due to network — accept the AI's original pick.
        output = candidate;
      } else {
        // Verified as NOT real (hallucination) — remember + retry.
        recommendationCache.add(candidate.title, candidate.year);
        if (attempt === 1) output = candidate; // final fallback
      }
    }

    if (!output) {
      throw new Error('Failed to generate a verifiable recommendation');
    }

    // Track in the dedup/exclude cache so the NEXT request for any mood/genre
    // rotates to a different title.
    recommendationCache.add(output.title, output.year);

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
