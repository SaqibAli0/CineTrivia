import { describe, it, expect } from 'vitest';
import { buildMovieSchema } from './movie-json-ld';
import type { MovieDetails } from '@/lib/tmdb-details';

function makeMovie(overrides: Partial<MovieDetails> = {}): MovieDetails {
  return {
    id: 1,
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through dream-sharing.',
    posterUrl: 'https://img/poster.jpg',
    backdropUrl: '',
    year: 2010,
    rating: 8.8,
    voteCount: 30000,
    genres: ['Action', 'Science Fiction'],
    genreLabel: 'Action / Science Fiction',
    runtime: 148,
    tagline: '',
    director: 'Christopher Nolan',
    cast: [{ name: 'Leonardo DiCaprio', character: 'Cobb', profileUrl: '' }],
    productionCompanies: ['Legendary Pictures'],
    language: 'English',
    budget: 160000000,
    revenue: 830000000,
    contentRating: 'PG-13',
    ...overrides,
  };
}

describe('buildMovieSchema', () => {
  it('emits a Movie schema with director/genre/rating and canonical url', () => {
    const schema = buildMovieSchema(makeMovie(), 'inception-2010');
    expect(schema['@type']).toBe('Movie');
    expect(schema.name).toBe('Inception');
    expect((schema.director as { name: string }).name).toBe('Christopher Nolan');
    expect(schema.url).toContain('/movie/inception-2010');
    expect(schema.alternateName).toBeUndefined();
    expect(schema.genre).not.toContain('Anime');
  });

  it('honors the /animation basePath', () => {
    const schema = buildMovieSchema(makeMovie(), 'spirited-away-2001', '/animation');
    expect(schema.url).toContain('/animation/spirited-away-2001');
  });

  it('adds "Anime" genre + alternateName when isAnime is true', () => {
    const schema = buildMovieSchema(
      makeMovie({ title: 'Your Name', language: 'Japanese', genres: ['Animation', 'Romance'] }),
      'your-name-2016',
      '/animation',
      true
    );
    expect(schema.genre).toContain('Anime');
    expect(schema.alternateName).toBe('Your Name (anime)');
  });

  it('does not duplicate an existing "Anime" genre', () => {
    const schema = buildMovieSchema(makeMovie({ genres: ['Anime'] }), 'x-2016', '/animation', true);
    const genres = schema.genre as string[];
    expect(genres.filter((g) => g === 'Anime')).toHaveLength(1);
  });
});
