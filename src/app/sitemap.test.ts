import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/tmdb-details', () => ({
  getPopularMoviesList: vi.fn(async () => [{ title: 'Inception', year: 2010, slug: 'inception-2010' }]),
}));
vi.mock('@/lib/tvmaze', () => ({
  getPopularShowsList: vi.fn(async (_pages: number, animationOnly: boolean) =>
    animationOnly
      ? [{ title: 'Naruto', year: 2002, slug: 'naruto-2002' }]
      : [{ title: 'Stranger Things', year: 2016, slug: 'stranger-things-2016' }]
  ),
}));
vi.mock('@/lib/tmdb-tv', () => ({
  getPopularAnimatedFilmsList: vi.fn(async () => [{ title: 'Spirited Away', year: 2001, slug: 'spirited-away-2001' }]),
}));
vi.mock('@/lib/blog', () => ({ getAllPosts: () => [] }));
vi.mock('@/lib/genres', () => ({ GENRES: [{ slug: 'action', name: 'Action' }] }));
vi.mock('@/lib/site', () => ({ SITE_URL: 'https://example.com' }));

import sitemap from './sitemap';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sitemap', () => {
  it('includes /tv landing + a dynamic TV detail page', async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://example.com/tv');
    expect(urls).toContain('https://example.com/tv/stranger-things-2016');
  });

  it('includes /animation landing + animated series + animated film pages', async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://example.com/animation');
    expect(urls).toContain('https://example.com/animation/naruto-2002');
    expect(urls).toContain('https://example.com/animation/spirited-away-2001');
  });

  it('still includes movie pages', async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://example.com/movie/inception-2010');
  });
});
