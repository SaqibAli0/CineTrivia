'use server';

import { recommendMovie } from '@/ai/flows/movie-recommendation';
import { movieFunFact } from '@/ai/flows/movie-fun-fact';
import { generateMoviePoster } from '@/ai/flows/generate-movie-poster';
import { 
  type RecommendMovieInput, 
  type RecommendMovieOutput,
  type MovieFunFactInput,
  type GenerateMoviePosterInput
} from '@/ai/types';

export async function getMovieRecommendation(input: RecommendMovieInput): Promise<RecommendMovieOutput> {
  return await recommendMovie(input);
}

export async function getMovieFunFact(input: MovieFunFactInput) {
  return await movieFunFact(input);
}

export async function getMoviePoster(input: GenerateMoviePosterInput) {
  return await generateMoviePoster(input);
}
