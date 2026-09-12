import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifyMovie } from './tmdb';

function tmdbMovie(id: number, title: string, year: number, opts: { poster?: boolean; rating?: number } = {}) {
  return {
    id,
    title,
    overview: `${title} overview`,
    poster_path: opts.poster === false ? null : `/p${id}.jpg`,
    backdrop_path: null,
    release_date: `${year}-05-01`,
    vote_average: opts.rating ?? 8.1,
    genre_ids: [18],
  };
}

function mockJson(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

describe('verifyMovie', () => {
  beforeEach(() => {
    process.env.TMDB_API_KEY = 'test-key';
    vi.restoreAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it('corrects a hallucinated year to TMDB\u2019s real year', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input: any) => {
      const url = new URL(String(input));
      const hasYear = url.searchParams.has('year');
      if (hasYear) {
        // Wrong year → no match, forcing the title-only fallback.
        return mockJson({ results: [] });
      }
      return mockJson({ results: [tmdbMovie(1, 'Inception', 2010, { rating: 8.8 })] });
    });

    const result = await verifyMovie('Inception', 1999);
    expect(result).not.toBeNull();
    expect(result!.year).toBe(2010);
    expect(result!.rating).toBe(8.8);
    expect(result!.posterUrl).toContain('/p1.jpg');
  });

  it('returns null when TMDB has no match at all', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockJson({ results: [] }));
    const result = await verifyMovie('Totally Made Up Film Xyz', 2050);
    expect(result).toBeNull();
  });

  it('prefers an exact normalized title match', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockJson({
        results: [
          tmdbMovie(2, 'Leon: The Professional Behind the Scenes', 1995),
          tmdbMovie(3, 'Léon: The Professional', 1994),
        ],
      })
    );

    const result = await verifyMovie('Leon The Professional', 1994);
    expect(result).not.toBeNull();
    expect(result!.title).toBe('Léon: The Professional');
    expect(result!.posterUrl).toContain('/p3.jpg');
  });

  it('verified picks always carry a real poster URL', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockJson({
        results: [
          tmdbMovie(4, 'No Poster Movie', 2000, { poster: false }),
          tmdbMovie(5, 'Has Poster Movie', 2001),
        ],
      })
    );

    const result = await verifyMovie('Has Poster Movie', 2001);
    expect(result).not.toBeNull();
    expect(result!.posterUrl).toContain('/p5.jpg');
  });
});
