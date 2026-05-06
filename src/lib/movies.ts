/**
 * Movie type definitions and utilities.
 *
 * Movies are now fetched dynamically from TMDB on each page load.
 * This file only exports the shared Movie interface and a small
 * fallback set used when TMDB is unreachable.
 */

import { TMDBMovie, getPosterUrl, getGenreLabel } from './tmdb';

export interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  description: string;
  posterUrl: string;
  rating: number;
  ageRating: string;
  director?: string;
}

/**
 * Convert a TMDB movie object into our app's Movie shape
 */
export function toMovie(tmdb: TMDBMovie): Movie {
  const year = tmdb.release_date ? parseInt(tmdb.release_date.split('-')[0], 10) : 0;
  const rating = Math.round(tmdb.vote_average * 10) / 10;

  return {
    id: tmdb.id,
    title: tmdb.title,
    genre: getGenreLabel(tmdb.genre_ids),
    year,
    description: tmdb.overview || 'No description available.',
    posterUrl: getPosterUrl(tmdb.poster_path, 'large'),
    rating,
    ageRating: 'PG-13', // TMDB doesn't include this in list endpoints
  };
}

/**
 * Minimal fallback collection shown when TMDB is unavailable.
 * Keeps the page functional even if the API is down.
 */
export const fallbackMovies: Movie[] = [
  {
    id: 1,
    title: "Dune: Part One",
    genre: "Sci-Fi",
    year: 2021,
    description: "A noble family becomes embroiled in a war for control over the galaxy's most precious resource.",
    posterUrl: "",
    rating: 8.0,
    ageRating: "PG-13",
  },
  {
    id: 2,
    title: "Parasite",
    genre: "Drama / Thriller",
    year: 2019,
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between two families.",
    posterUrl: "",
    rating: 8.6,
    ageRating: "R",
  },
  {
    id: 3,
    title: "Inception",
    genre: "Sci-Fi / Thriller",
    year: 2010,
    description: "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.",
    posterUrl: "",
    rating: 8.8,
    ageRating: "PG-13",
  },
  {
    id: 4,
    title: "Spirited Away",
    genre: "Animation",
    year: 2001,
    description: "A young girl wanders into a world ruled by gods, witches, and spirits.",
    posterUrl: "",
    rating: 8.6,
    ageRating: "PG",
  },
];
