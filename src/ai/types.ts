import {z} from 'genkit';

/**
 * Which kind of title to recommend. 'movie' is the default (preserves the
 * original movie-only behavior); 'tv' asks for a TV series; 'animation' asks
 * for an animated title (film or series).
 */
export const MediaKindSchema = z.enum(['movie', 'tv', 'animation']);
export type MediaKind = z.infer<typeof MediaKindSchema>;

// Movie recommendation schemas
export const RecommendMovieInputSchema = z.object({
  moodOrGenre: z
    .string()
    .describe('The mood (e.g., happy, sad) or genre (e.g., action, comedy, drama) for the recommendation.'),
  mediaType: MediaKindSchema.optional().describe(
    "What to recommend: 'movie' (default), 'tv', or 'animation'."
  ),
});

export const RecommendMovieOutputSchema = z.object({
  title: z.string().describe('The title of the recommended movie.'),
  year: z.number().describe('The release year of the movie.'),
  genre: z.string().describe('The primary genre of the movie.'),
  description: z.string().describe('A brief, compelling plot summary of the movie.'),
  rating: z.number().describe("The movie's critical rating out of 10, can be a decimal (e.g., 8.5)."),
  ageRating: z.string().describe('The age rating of the movie (e.g., PG-13, R, G).'),
});

export type RecommendMovieInput = z.infer<typeof RecommendMovieInputSchema>;
export type RecommendMovieOutput = z.infer<typeof RecommendMovieOutputSchema>;

// Movie poster schemas
export const GenerateMoviePosterInputSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  description: z.string().describe('A brief description of the movie plot.'),
  genre: z.string().describe('The genre of the movie.'),
});

export const GenerateMoviePosterOutputSchema = z.object({
  posterDataUri: z.string().describe('The generated movie poster as a data URI.'),
});

export type GenerateMoviePosterInput = z.infer<typeof GenerateMoviePosterInputSchema>;
export type GenerateMoviePosterOutput = z.infer<typeof GenerateMoviePosterOutputSchema>;

// Movie fun fact schemas
export const MovieFunFactInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie/show to get a fun fact about.'),
  skipCache: z.boolean().optional().describe('If true, generate a fresh fact.'),
  mediaType: MediaKindSchema.optional().describe(
    "What kind of title this is: 'movie' (default), 'tv', or 'animation'. Affects phrasing."
  ),
});

export type MovieFunFactInput = z.infer<typeof MovieFunFactInputSchema>;
