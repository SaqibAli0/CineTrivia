'use server';

import { recommendMovie } from '@/ai/flows/movie-recommendation';
import { movieFunFact } from '@/ai/flows/movie-fun-fact';
import { generateMoviePoster } from '@/ai/flows/generate-movie-poster';
import {
  type RecommendMovieInput,
  type RecommendMovieOutput,
  type MovieFunFactInput,
  type GenerateMoviePosterInput,
} from '@/ai/types';
import { withRetry } from '@/lib/retry';

const MAX_INPUT_LENGTH = 200;

const rateLimiter = {
  requests: new Map<string, number[]>(),

  check(action: string, maxPerMinute: number = 10): boolean {
    const now = Date.now();
    const windowMs = 60_000;
    const timestamps = this.requests.get(action) || [];
    const recent = timestamps.filter((t) => now - t < windowMs);
    this.requests.set(action, recent);

    if (recent.length >= maxPerMinute) return false;
    recent.push(now);
    return true;
  },
};

function validateInput(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input too long. Maximum ${MAX_INPUT_LENGTH} characters.`);
  }
  return trimmed;
}

/**
 * Wrap errors into short, user-friendly messages.
 * Logs the full error server-side for debugging.
 */
function friendlyError(error: unknown, fallbackMessage: string): Error {
  const raw = error instanceof Error ? error.message : String(error);
  console.error('[Action Error]', raw);

  if (raw.includes('503') || raw.includes('Service Unavailable')) {
    return new Error('Our service is temporarily busy. Please try again in a moment.');
  }
  if (raw.includes('429') || raw.includes('rate') || raw.includes('quota')) {
    return new Error('Too many requests. Please wait a moment and try again.');
  }
  if (raw.includes('401') || raw.includes('API key')) {
    return new Error('Service configuration error. Please contact support.');
  }
  if (raw.includes('TMDB') || raw.includes('TMDB_API_KEY')) {
    return new Error('Movie database is temporarily unavailable.');
  }

  return new Error(fallbackMessage);
}

export async function getMovieRecommendation(input: RecommendMovieInput): Promise<RecommendMovieOutput> {
  if (!rateLimiter.check('recommendation', 10)) {
    throw new Error('Too many requests. Please wait a moment.');
  }

  try {
    const moodOrGenre = validateInput(input.moodOrGenre);
    return await withRetry(() => recommendMovie({ moodOrGenre }));
  } catch (error) {
    throw friendlyError(error, 'Could not get a recommendation right now. Please try again.');
  }
}

export async function getMovieFunFact(input: MovieFunFactInput) {
  if (!rateLimiter.check('funFact', 15)) {
    throw new Error('Too many requests. Please wait a moment.');
  }

  try {
    const movieTitle = validateInput(input.movieTitle);
    return await withRetry(() => movieFunFact({ movieTitle, skipCache: input.skipCache }));
  } catch (error) {
    throw friendlyError(error, 'Could not fetch a fun fact right now. Please try again.');
  }
}

export async function getMoviePoster(input: GenerateMoviePosterInput) {
  if (!rateLimiter.check('poster', 20)) {
    throw new Error('Too many requests. Please wait a moment.');
  }

  try {
    const title = validateInput(input.title);
    return await withRetry(() => generateMoviePoster({
      title,
      description: input.description,
      genre: input.genre,
    }), { maxAttempts: 2 });
  } catch (error) {
    throw friendlyError(error, 'Could not load poster.');
  }
}
