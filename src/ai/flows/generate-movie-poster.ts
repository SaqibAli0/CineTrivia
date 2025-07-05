'use server';
/**
 * @fileOverview A flow to generate a movie poster image.
 *
 * - generateMoviePoster - A function that generates a movie poster.
 * - GenerateMoviePosterInput - The input type for the generateMoviePoster function.
 * - GenerateMoviePosterOutput - The return type for the generateMoviePoster function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMoviePosterInputSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  description: z.string().describe('A brief description of the movie plot.'),
  genre: z.string().describe('The genre of the movie.'),
});
export type GenerateMoviePosterInput = z.infer<typeof GenerateMoviePosterInputSchema>;

const GenerateMoviePosterOutputSchema = z.object({
  posterDataUri: z.string().describe('The generated movie poster as a data URI.'),
});
export type GenerateMoviePosterOutput = z.infer<typeof GenerateMoviePosterOutputSchema>;

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
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a minimalist, artistic movie poster for a ${input.genre} film titled "${input.title}". The plot is: ${input.description}. The poster should be visually striking and capture the essence of the movie's theme. Avoid using any text on the poster.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed.');
    }

    return { posterDataUri: media.url };
  }
);
