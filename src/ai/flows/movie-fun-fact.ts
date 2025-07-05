'use server';

/**
 * @fileOverview Provides interesting and relevant fun facts or behind-the-scenes trivia about a movie.
 *
 * - movieFunFact - A function that generates movie fun facts.
 * - MovieFunFactInput - The input type for the movieFunFact function.
 * - MovieFunFactOutput - The return type for the movieFunFact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MovieFunFactInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie.'),
});
export type MovieFunFactInput = z.infer<typeof MovieFunFactInputSchema>;

const MovieFunFactOutputSchema = z.object({
  funFact: z.string().describe('An interesting fun fact about the movie.'),
});
export type MovieFunFactOutput = z.infer<typeof MovieFunFactOutputSchema>;

export async function movieFunFact(input: MovieFunFactInput): Promise<MovieFunFactOutput> {
  return movieFunFactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'movieFunFactPrompt',
  input: {schema: MovieFunFactInputSchema},
  output: {schema: MovieFunFactOutputSchema},
  prompt: `You are a movie trivia expert. Generate one interesting and relevant fun fact or behind-the-scenes trivia about the movie "{{{movieTitle}}}".`,
});

const movieFunFactFlow = ai.defineFlow(
  {
    name: 'movieFunFactFlow',
    inputSchema: MovieFunFactInputSchema,
    outputSchema: MovieFunFactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
