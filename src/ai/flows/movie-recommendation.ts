'use server';

/**
 * @fileOverview AI-powered movie recommendation flow.
 *
 * - recommendMovie - A function that recommends a movie based on the specified mood or genre.
 * - RecommendMovieInput - The input type for the recommendMovie function.
 * - RecommendMovieOutput - The return type for the recommendMovie function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendMovieInputSchema = z.object({
  moodOrGenre: z
    .string()
    .describe('The mood (e.g., happy, sad) or genre (e.g., action, comedy, drama) for the movie recommendation.'),
});
export type RecommendMovieInput = z.infer<typeof RecommendMovieInputSchema>;

const RecommendMovieOutputSchema = z.object({
  title: z.string().describe("The title of the recommended movie."),
  year: z.number().describe("The release year of the movie."),
  genre: z.string().describe("The primary genre of the movie."),
  description: z.string().describe("A brief, compelling plot summary of the movie."),
  rating: z.number().describe("The movie's critical rating out of 10, can be a decimal (e.g., 8.5)."),
  ageRating: z.string().describe("The age rating of the movie (e.g., PG-13, R, G).")
});
export type RecommendMovieOutput = z.infer<typeof RecommendMovieOutputSchema>;


export async function recommendMovie(input: RecommendMovieInput): Promise<RecommendMovieOutput> {
  return recommendMovieFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendMoviePrompt',
  input: {schema: RecommendMovieInputSchema},
  output: {schema: RecommendMovieOutputSchema},
  prompt: `You are a movie expert. Recommend one movie based on the specified mood or genre.
Provide the movie title, year, genre, a brief description, a rating out of 10, and its age rating.

Mood or Genre: {{{moodOrGenre}}}
`,
});

const recommendMovieFlow = ai.defineFlow(
  {
    name: 'recommendMovieFlow',
    inputSchema: RecommendMovieInputSchema,
    outputSchema: RecommendMovieOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
