import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/tmdb-client', () => ({
  tmdbFetch: vi.fn(),
  TMDBUnreachableError: class TMDBUnreachableError extends Error {},
}));

vi.mock('@/lib/tvmaze', () => ({
  searchShows: vi.fn(),
}));

import { tmdbFetch } from '@/lib/tmdb-client';
import { searchShows } from '@/lib/tvmaze';
import { searchMedia } from './media-search-actions';
import type { MediaItem } from '@/lib/media';

const mockTmdb = tmdbFetch as unknown as ReturnType<typeof vi.fn>;
const mockShows = searchShows as unknown as ReturnType<typeof vi.fn>;

const tvItem: MediaItem = {
  id: 1, source: 'tvmaze', mediaType: 'tv', title: 'Stranger Things', year: 2016,
  posterUrl: 'p.jpg', rating: 8.4, genre: 'Drama', slug: 'stranger-things-2016', isAnimation: false,
};
const animItem: MediaItem = {
  id: 2, source: 'tvmaze', mediaType: 'tv', title: 'Naruto', year: 2002,
  posterUrl: 'n.jpg', rating: 8, genre: 'Anime', slug: 'naruto-2002', isAnimation: true,
};

beforeEach(() => {
  mockTmdb.mockReset();
  mockShows.mockReset();
});

describe('searchMedia', () => {
  it('returns empty for too-short queries without hitting any source', async () => {
    const res = await searchMedia('a', 'all');
    expect(res.items).toEqual([]);
    expect(mockTmdb).not.toHaveBeenCalled();
    expect(mockShows).not.toHaveBeenCalled();
  });

  it("blends movies and shows for scope 'all'", async () => {
    mockTmdb.mockResolvedValue({
      results: [
        { id: 10, title: 'The Matrix', overview: '', poster_path: '/m.jpg', release_date: '1999-03-31', vote_average: 8.2, genre_ids: [28] },
      ],
    });
    mockShows.mockResolvedValue([tvItem]);

    const res = await searchMedia('matrix', 'all');
    const titles = res.items.map((i) => i.title);
    expect(titles).toContain('The Matrix');
    expect(titles).toContain('Stranger Things');
    // Each links via basePath.
    const movie = res.items.find((i) => i.title === 'The Matrix')!;
    expect(movie.mediaType).toBe('movie');
    expect(movie.source).toBe('tmdb');
  });

  it("scope 'tv' queries TVmaze non-animation only and skips TMDB", async () => {
    mockShows.mockResolvedValue([tvItem, animItem]);
    const res = await searchMedia('tvscope', 'tv');
    expect(mockTmdb).not.toHaveBeenCalled();
    expect(res.items.map((i) => i.title)).toEqual(['Stranger Things']);
    expect(mockShows).toHaveBeenCalledWith('tvscope', false);
  });

  it("scope 'animation' asks TVmaze for animation only", async () => {
    mockShows.mockResolvedValue([animItem]);
    mockTmdb.mockResolvedValue({ results: [] });
    const res = await searchMedia('naruto', 'animation');
    expect(mockShows).toHaveBeenCalledWith('naruto', true);
    expect(res.items[0].isAnimation).toBe(true);
  });

  it("scope 'animation' also includes animated TMDB films and excludes non-animated ones", async () => {
    mockShows.mockResolvedValue([]);
    mockTmdb.mockResolvedValue({
      results: [
        { id: 20, title: 'Spirited Away', overview: '', poster_path: '/s.jpg', release_date: '2001-07-20', vote_average: 8.5, genre_ids: [16, 14] },
        { id: 21, title: 'The Matrix', overview: '', poster_path: '/m.jpg', release_date: '1999-03-31', vote_average: 8.2, genre_ids: [28] },
      ],
    });
    const res = await searchMedia('spirited', 'animation');
    const titles = res.items.map((i) => i.title);
    expect(titles).toContain('Spirited Away');
    expect(titles).not.toContain('The Matrix');
    expect(res.items.every((i) => i.isAnimation)).toBe(true);
  });

  it('marks unavailable when the only queried source is down', async () => {
    mockShows.mockRejectedValue(new Error('network'));
    const res = await searchMedia('downscope', 'tv');
    expect(res.unavailable).toBe(true);
  });
});
