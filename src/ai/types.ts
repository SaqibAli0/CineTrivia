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
  title: z.string().describe('The title of the recommended title.'),
  year: z.number().describe('The release/first-air year.'),
  genre: z.string().describe('The primary genre.'),
  description: z.string().describe('A brief, compelling plot summary.'),
  rating: z.number().describe("The critical rating out of 10, can be a decimal (e.g., 8.5)."),
  ageRating: z.string().describe('The age rating (e.g., PG-13, R, G, TV-MA).'),
  /**
   * Real poster URL from the SAME source that verified the pick (TVmaze for
   * TV/anime, TMDB for movies/animated films). Populated by the flow after
   * verification so the card shows the correct poster — never a movie poster
   * for a TV show. Empty when verification was skipped/unavailable.
   */
  posterUrl: z.string().optional().describe('Verified poster URL from the correct source.'),
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
