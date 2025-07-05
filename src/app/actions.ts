'use server';

import { recommendMovie, RecommendMovieInput, RecommendMovieOutput } from '@/ai/flows/movie-recommendation';
import { movieFunFact, MovieFunFactInput } from '@/ai/flows/movie-fun-fact';
import { generateMoviePoster, GenerateMoviePosterInput } from '@/ai/flows/generate-movie-poster';

export async function getMovieRecommendation(input: RecommendMovieInput): Promise<RecommendMovieOutput> {
  return await recommendMovie(input);
}

export async function getMovieFunFact(input: MovieFunFactInput) {
  return await movieFunFact(input);
}

export async function getMoviePoster(input: GenerateMoviePosterInput) {
  return await generateMoviePoster(input);
}
