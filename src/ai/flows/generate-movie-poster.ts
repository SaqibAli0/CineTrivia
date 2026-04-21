/**
 * @fileOverview Movie poster generation flow.
 *
 * Fetches real movie posters using Tavily Search API with fallback mechanisms.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateMoviePosterInputSchema,
  GenerateMoviePosterOutputSchema,
  type GenerateMoviePosterInput,
  type GenerateMoviePosterOutput,
} from '@/ai/types';
import {searchMoviePoster} from '@/ai/services/tavily';

export type {GenerateMoviePosterInput, GenerateMoviePosterOutput};

/**
 * Generate movie poster by fetching real poster image
 */
export async function generateMoviePoster(input: GenerateMoviePosterInput): Promise<GenerateMoviePosterOutput> {
  return generateMoviePosterFlow(input);
}

// Flow definition
const generateMoviePosterFlow = ai.defineFlow(
  {
    name: 'generateMoviePosterFlow',
    inputSchema: GenerateMoviePosterInputSchema,
    outputSchema: GenerateMoviePosterOutputSchema,
  },
  async (input) => {
    try {
      // Search for movie poster using Tavily
      const posterUrl = await searchMoviePoster(input.title);

      // Fetch and convert to base64
      const posterDataUri = await fetchAndConvertToBase64(posterUrl);

      return { posterDataUri };
    } catch (error) {
      console.error('Failed to fetch movie poster:', error);
      throw new Error('Failed to fetch movie poster. Please try again later.');
    }
  }
);

/**
 * Fetch image from URL and convert to base64 data URI
 */
async function fetchAndConvertToBase64(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const contentType = response.headers.get('content-type') || 'image/jpeg';

  console.log(`Image fetched successfully: ${buffer.length} bytes`);

  return `data:${contentType};base64,${base64}`;
}
