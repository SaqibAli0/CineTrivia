/**
 * Movie Poster Flow
 *
 * Finds a poster URL for a given movie title.
 * Strategy:
 *   1. Check server-side cache
 *   2. Search TMDB by title (free)
 *   3. Fall back to Tavily search (paid, last resort)
 *
 * Returns a URL string instead of base64 to avoid
 * sending hundreds of KB over the wire.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateMoviePosterInputSchema,
  GenerateMoviePosterOutputSchema,
  type GenerateMoviePosterInput,
  type GenerateMoviePosterOutput,
} from '@/ai/types';
import { searchMovie, getPosterUrl } from '@/lib/tmdb';
import { searchMoviePoster } from '@/ai/services/tavily';
import { posterUrlCache } from '@/ai/services/cache';

export type { GenerateMoviePosterInput, GenerateMoviePosterOutput };

export async function generateMoviePoster(input: GenerateMoviePosterInput): Promise<GenerateMoviePosterOutput> {
  return generateMoviePosterFlow(input);
}

const generateMoviePosterFlow = ai.defineFlow(
  {
    name: 'generateMoviePosterFlow',
    inputSchema: GenerateMoviePosterInputSchema,
    outputSchema: GenerateMoviePosterOutputSchema,
  },
  async (input) => {
    const cacheKey = input.title.toLowerCase().trim();

    // 1. Check cache
    const cached = posterUrlCache.get(cacheKey);
    if (cached) {
      return { posterDataUri: cached };
    }

    // 2. Try TMDB (free)
    try {
      const tmdbResult = await searchMovie(input.title);
      if (tmdbResult?.poster_path) {
        const url = getPosterUrl(tmdbResult.poster_path, 'large');
        posterUrlCache.set(cacheKey, url);
        return { posterDataUri: url };
      }
    } catch (error) {
      console.error('TMDB poster search failed:', error);
    }

    // 3. Fall back to Tavily (paid)
    try {
      const tavilyUrl = await searchMoviePoster(input.title);
      posterUrlCache.set(cacheKey, tavilyUrl);
      return { posterDataUri: tavilyUrl };
    } catch (error) {
      console.error('Tavily poster search failed:', error);
    }

    // No poster found — return empty string, UI will show placeholder
    return { posterDataUri: '' };
  }
);
