import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { searchMovies } from './search-actions';

function tmdbMovie(id: number, title: string, year = 2010, withPoster = true) {
  return {
    id,
    title,
    overview: `${title} overview`,
    poster_path: withPoster ? `/poster${id}.jpg` : null,
    backdrop_path: null,
    release_date: `${year}-01-01`,
    vote_average: 7.5,
    genre_ids: [18],
  };
}

function mockResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe('searchMovies', () => {
  beforeEach(() => {
    process.env.TMDB_API_KEY = 'test-key';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns [] and makes no TMDB call for short queries', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const result = await searchMovies('a', 1);
    expect(result.movies).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns [] and makes no TMDB call for empty query', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const result = await searchMovies('   ', 1);
    expect(result.movies).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('maps TMDB results to the app Movie shape', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        page: 1,
        results: [tmdbMovie(101, 'Leon The Professional', 1994)],
        total_pages: 1,
        total_results: 1,
      })
    );

    const result = await searchMovies('leon-unique-map', 1);
    expect(result.movies).toHaveLength(1);
    expect(result.movies[0]).toMatchObject({
      id: 101,
      title: 'Leon The Professional',
      year: 1994,
    });
    expect(result.movies[0].posterUrl).toContain('/poster101.jpg');
  });

  it('keeps poster-less results (year is what matters), only drops undated ones', async () => {
    const dated = tmdbMovie(1, 'Has Poster', 2010, true);
    const noPoster = tmdbMovie(2, 'No Poster', 2010, false);
    const noYear = { ...tmdbMovie(3, 'No Year', 2010, true), release_date: '' };

    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        page: 1,
        results: [dated, noPoster, noYear],
        total_pages: 1,
        total_results: 3,
      })
    );

    const result = await searchMovies('poster-filter-unique', 1);
    // Poster-less movie is kept; only the undated one is dropped.
    expect(result.movies.map((m) => m.id).sort()).toEqual([1, 2]);
  });

  it('serves an identical query|page from cache (one fetch)', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        page: 1,
        results: [tmdbMovie(5, 'Cached Movie')],
        total_pages: 1,
        total_results: 1,
      })
    );

    await searchMovies('cache-dedupe-unique', 1);
    await searchMovies('cache-dedupe-unique', 1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('fills a full page of 20 by backfilling from later TMDB pages', async () => {
    // Page 1: 20 raw, but 3 are pornographic → 17 safe.
    // Page 2: 20 more clean → should top up to 20 total.
    vi.spyOn(global, 'fetch').mockImplementation(async (input: any) => {
      const url = new URL(String(input));
      const page = Number(url.searchParams.get('page'));
      if (page === 1) {
        const results = Array.from({ length: 20 }, (_, k) => tmdbMovie(k + 1, `Clean ${k + 1}`));
        // Poison 3 of them.
        results[0].title = 'Bikini Avengers';
        results[1].title = 'Some XXX Parody';
        results[2].title = 'Hardcore Porn 5';
        return mockResponse({ page: 1, results, total_pages: 50, total_results: 1000 });
      }
      const results = Array.from({ length: 20 }, (_, k) => tmdbMovie(100 + k, `Second ${k}`));
      return mockResponse({ page, results, total_pages: 50, total_results: 1000 });
    });

    const result = await searchMovies('fill-to-twenty-unique', 1);
    expect(result.movies).toHaveLength(20);
    // None of the poisoned titles survive.
    const titles = result.movies.map((m) => m.title);
    expect(titles).not.toContain('Bikini Avengers');
  });

  it('stops fetching once 20 safe results are collected (does not pull all 3 pages)', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async () => {
      const results = Array.from({ length: 20 }, (_, k) => tmdbMovie(k + 1, `Clean ${k + 1}`));
      return mockResponse({ page: 1, results, total_pages: 50, total_results: 1000 });
    });

    const result = await searchMovies('exactly-twenty-unique', 1);
    expect(result.movies).toHaveLength(20);
    // Page 1 already had 20 safe results → only one fetch needed.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('dropdown target (3) needs only one TMDB fetch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async () => {
      const results = Array.from({ length: 20 }, (_, k) => tmdbMovie(k + 1, `Clean ${k + 1}`));
      return mockResponse({ page: 1, results, total_pages: 50, total_results: 1000 });
    });

    const result = await searchMovies('dropdown-target-unique', 1, 3);
    expect(result.movies).toHaveLength(3);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('flags unavailable when the connection keeps failing (ECONNRESET)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(
      Object.assign(new Error('fetch failed'), { code: 'ECONNRESET' })
    );

    const result = await searchMovies('econnreset-unique', 1);
    expect(result.unavailable).toBe(true);
    expect(result.movies).toEqual([]);
  });

  it('does NOT flag unavailable for a genuine HTTP error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({}, false, 401));

    const result = await searchMovies('http-error-unique', 1);
    expect(result.unavailable).toBeFalsy();
    expect(result.movies).toEqual([]);
  });

  it('reports hasMore=false once total pages are capped and reached', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse({
        page: 2,
        results: [tmdbMovie(11, 'Last Page Movie')],
        total_pages: 500,
        total_results: 10000,
      })
    );

    const result = await searchMovies('has-more-unique', 2);
    expect(result.totalPages).toBe(2);
    expect(result.hasMore).toBe(false);
  });
});
