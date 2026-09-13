import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./tmdb-client', () => ({
  tmdbFetch: vi.fn(),
  TMDBUnreachableError: class TMDBUnreachableError extends Error {},
}));

import { tmdbFetch } from './tmdb-client';
import {
  findTvIdByImdb,
  getTvGapFill,
  getAnimatedFilmsCollection,
} from './tmdb-tv';

const mockFetch = tmdbFetch as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('findTvIdByImdb', () => {
  it('resolves an IMDB id to a TMDB tv id', async () => {
    mockFetch.mockResolvedValue({ tv_results: [{ id: 66732 }], movie_results: [] });
    const id = await findTvIdByImdb('tt4574334');
    expect(id).toBe(66732);
  });

  it('returns null and caches a negative when no match exists', async () => {
    mockFetch.mockResolvedValue({ tv_results: [], movie_results: [] });
    const id = await findTvIdByImdb('tt0000000');
    expect(id).toBeNull();
    // Second call should hit the negative cache (no extra fetch).
    const callsAfterFirst = mockFetch.mock.calls.length;
    await findTvIdByImdb('tt0000000');
    expect(mockFetch.mock.calls.length).toBe(callsAfterFirst);
  });

  it('returns null for a missing imdb id without fetching', async () => {
    expect(await findTvIdByImdb(null)).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('getTvGapFill', () => {
  it('returns empty gap-fill when there is no IMDB match, without throwing', async () => {
    mockFetch.mockResolvedValue({ tv_results: [], movie_results: [] });
    const gap = await getTvGapFill('tt9999999');
    expect(gap).toEqual({ similar: [], providers: [], trailer: null, backdropUrl: null });
  });

  it('enriches with similar shows + providers via the IMDB id', async () => {
    mockFetch.mockImplementation(async (endpoint: string) => {
      if (endpoint.startsWith('/find/')) return { tv_results: [{ id: 100 }], movie_results: [] };
      if (endpoint === '/tv/100/similar')
        return {
          results: [
            {
              id: 200,
              name: 'Similar Show',
              overview: 'A show',
              poster_path: '/p.jpg',
              first_air_date: '2018-01-01',
              vote_average: 8.1,
              genre_ids: [18],
            },
          ],
        };
      if (endpoint === '/tv/100/recommendations') return { results: [] };
      if (endpoint === '/tv/100/watch/providers')
        return { results: { US: { flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/n.jpg' }] } } };
      if (endpoint === '/tv/100/videos')
        return { results: [{ name: 'Trailer', key: 'abc', site: 'YouTube', type: 'Trailer', official: true, published_at: '2018-01-01T00:00:00Z' }] };
      if (endpoint === '/tv/100') return { backdrop_path: '/bd.jpg' };
      return { results: [] };
    });

    const gap = await getTvGapFill('tt123');
    expect(gap.similar).toHaveLength(1);
    expect(gap.similar[0].title).toBe('Similar Show');
    expect(gap.providers[0].name).toBe('Netflix');
    expect(gap.trailer?.embedUrl).toBe('https://www.youtube.com/embed/abc');
    expect(gap.backdropUrl).toBe('https://image.tmdb.org/t/p/w1280/bd.jpg');
  });
});

describe('getAnimatedFilmsCollection', () => {
  it('returns genre-16 films as animation MediaItems, content-filtered', async () => {
    mockFetch.mockResolvedValue({
      results: [
        {
          id: 1,
          title: 'Spirited Away',
          overview: 'A girl in a spirit world',
          poster_path: '/s.jpg',
          release_date: '2001-07-20',
          vote_average: 8.5,
          genre_ids: [16, 14],
        },
        {
          id: 2,
          title: 'XXX Hardcore Toon',
          overview: 'porn',
          poster_path: '/x.jpg',
          release_date: '2010-01-01',
          vote_average: 5,
          genre_ids: [16],
        },
      ],
    });

    const films = await getAnimatedFilmsCollection(10, 1);
    expect(films).toHaveLength(1);
    expect(films[0].title).toBe('Spirited Away');
    expect(films[0].isAnimation).toBe(true);
    expect(films[0].mediaType).toBe('movie');
    expect(films[0].slug).toBe('spirited-away-2001');
  });
});
