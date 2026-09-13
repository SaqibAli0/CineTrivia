import { describe, it, expect } from 'vitest';
import { buildTvSeriesSchema } from './tv-series-json-ld';
import type { TvShowDetails } from '@/lib/tvmaze';

function makeShow(overrides: Partial<TvShowDetails> = {}): TvShowDetails {
  return {
    id: 1,
    source: 'tvmaze',
    mediaType: 'tv',
    title: 'Stranger Things',
    overview: 'Kids in a small town uncover a mystery.',
    posterUrl: 'https://img/poster.jpg',
    year: 2016,
    endYear: 0,
    rating: 8.4,
    genres: ['Drama', 'Science-Fiction'],
    genreLabel: 'Drama / Science-Fiction',
    status: 'Running',
    network: 'Netflix',
    language: 'English',
    seasons: 4,
    totalEpisodes: 34,
    runtime: 60,
    cast: [{ name: 'Winona Ryder', character: 'Joyce', profileUrl: '', voice: false }],
    imdbId: 'tt4574334',
    isAnimation: false,
    tvmazeUrl: 'https://www.tvmaze.com/shows/2993/stranger-things',
    ...overrides,
  };
}

describe('buildTvSeriesSchema', () => {
  it('emits a TVSeries schema with seasons/episodes and rating', () => {
    const schema = buildTvSeriesSchema(makeShow(), '/tv/stranger-things-2016');
    expect(schema['@type']).toBe('TVSeries');
    expect(schema.name).toBe('Stranger Things');
    expect(schema.numberOfSeasons).toBe(4);
    expect(schema.numberOfEpisodes).toBe(34);
    expect((schema.aggregateRating as { ratingValue: number }).ratingValue).toBe(8.4);
    expect(schema.url).toContain('/tv/stranger-things-2016');
    expect(schema.productionCompany).toEqual({ '@type': 'Organization', name: 'Netflix' });
  });

  it('omits aggregateRating when unrated', () => {
    const schema = buildTvSeriesSchema(makeShow({ rating: 0 }), '/tv/x-2016');
    expect(schema.aggregateRating).toBeUndefined();
  });

  it('works for an animation-section path', () => {
    const schema = buildTvSeriesSchema(makeShow({ isAnimation: true }), '/animation/naruto-2002');
    expect(schema.url).toContain('/animation/naruto-2002');
    expect(schema['@type']).toBe('TVSeries');
  });
});
