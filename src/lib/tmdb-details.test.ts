import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { findMovieId } from './tmdb-details';

function tmdbMovie(id: number, title: string, year: number) {
  return {
    id,
    title,
    overview: '',
    poster_path: `/p${id}.jpg`,
    backdrop_path: null,
    release_date: `${year}-01-01`,
    vote_average: 7,
    genre_ids: [18],
  };
}

function json(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

describe('findMovieId — the "Léon" resolution bug', () => {
  beforeEach(() => {
    process.env.TMDB_API_KEY = 'test-key';
    vi.restoreAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it('resolves via the shortened-title fallback when the full title misses', async () => {
    // Simulate TMDB: the de-accented full title "Leon The Professional" returns
    // nothing, but the leading word "Leon" returns the 1994 film.
    vi.spyOn(global, 'fetch').mockImplementation(async (input: any) => {
      const url = new URL(String(input));
      const query = url.searchParams.get('query') ?? '';
      if (/^leon$/i.test(query)) {
        return json({ results: [tmdbMovie(101, 'Léon: The Professional', 1994)] });
      }
      // Any other query (the full mangled title) finds nothing.
      return json({ results: [] });
    });

    const id = await findMovieId('Leon The Professional', 1994);
    expect(id).toBe(101);
  });

  it('picks the result whose year is closest to the target', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      json({
        results: [
          tmdbMovie(1, 'Leon', 2021), // remake / unrelated, wrong year
          tmdbMovie(2, 'Léon: The Professional', 1994), // the one we want
        ],
      })
    );

    const id = await findMovieId('Leon The Professional', 1994);
    expect(id).toBe(2);
  });

  it('returns null when nothing matches at all', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(json({ results: [] }));
    const id = await findMovieId('Nonexistent Film Zzz', 3000);
    expect(id).toBeNull();
  });
});
