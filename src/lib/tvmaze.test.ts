import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the client so no real network calls happen.
vi.mock('./tvmaze-client', () => ({
  tvmazeFetch: vi.fn(),
  TVmazeUnreachableError: class TVmazeUnreachableError extends Error {},
  TVmazeHttpError: class TVmazeHttpError extends Error {},
}));

import { tvmazeFetch } from './tvmaze-client';
import {
  stripHtml,
  isAnimationShow,
  showToMediaItem,
  searchShows,
  getShowDetails,
  getAnimationSeriesCollection,
  verifyShow,
  type TvmazeShow,
} from './tvmaze';

const mockFetch = tvmazeFetch as unknown as ReturnType<typeof vi.fn>;

function makeShow(overrides: Partial<TvmazeShow> = {}): TvmazeShow {
  return {
    id: 1,
    url: 'https://www.tvmaze.com/shows/1/under-the-dome',
    name: 'Under the Dome',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Science-Fiction', 'Thriller'],
    status: 'Ended',
    runtime: 60,
    averageRuntime: 60,
    premiered: '2013-06-24',
    ended: '2015-09-10',
    officialSite: null,
    rating: { average: 6.6 },
    weight: 100,
    network: { id: 2, name: 'CBS', country: { name: 'United States', code: 'US' } },
    webChannel: null,
    externals: { tvrage: null, thetvdb: null, imdb: 'tt1553656' },
    image: { medium: 'm.jpg', original: 'o.jpg' },
    summary: '<p><b>Under the Dome</b> is the story of a small town.</p>',
    ...overrides,
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('stripHtml', () => {
  it('removes tags and decodes entities', () => {
    expect(stripHtml('<p><b>Hi</b> &amp; bye</p>')).toBe('Hi & bye');
    expect(stripHtml(null)).toBe('');
  });
});

describe('isAnimationShow', () => {
  it('detects anime/animation/cartoon genre tags', () => {
    expect(isAnimationShow({ genres: ['Anime', 'Action'], type: 'Animation' })).toBe(true);
    expect(isAnimationShow({ genres: ['Animation'], type: 'Scripted' })).toBe(true);
    expect(isAnimationShow({ genres: ['Drama'], type: 'Scripted' })).toBe(false);
  });
});

describe('showToMediaItem', () => {
  it('maps a TVmaze show to a tv/tvmaze MediaItem', () => {
    const item = showToMediaItem(makeShow());
    expect(item.source).toBe('tvmaze');
    expect(item.mediaType).toBe('tv');
    expect(item.year).toBe(2013);
    expect(item.rating).toBe(6.6);
    expect(item.slug).toBe('under-the-dome-2013');
    expect(item.isAnimation).toBe(false);
    expect(item.posterUrl).toBe('o.jpg');
  });

  it('flags animated shows for the animation section', () => {
    const item = showToMediaItem(makeShow({ name: 'Naruto', genres: ['Anime', 'Action'], premiered: '2002-10-03' }));
    expect(item.isAnimation).toBe(true);
  });
});

describe('searchShows', () => {
  it('maps search results and can filter to animation only', async () => {
    mockFetch.mockResolvedValue([
      { score: 0.9, show: makeShow({ id: 1, name: 'Under the Dome', genres: ['Drama'] }) },
      { score: 0.8, show: makeShow({ id: 2, name: 'Naruto', genres: ['Anime'] }) },
    ]);

    const all = await searchShows('x');
    expect(all).toHaveLength(2);

    const animOnly = await searchShows('x', true);
    expect(animOnly).toHaveLength(1);
    expect(animOnly[0].title).toBe('Naruto');
  });

  it('drops pornographic titles (content filter, no adult flag)', async () => {
    mockFetch.mockResolvedValue([
      { score: 0.9, show: makeShow({ id: 3, name: 'Hardcore Porn Show', genres: ['Adult'] }) },
      { score: 0.8, show: makeShow({ id: 4, name: 'Clean Show', genres: ['Drama'] }) },
    ]);
    const results = await searchShows('x');
    expect(results.map((r) => r.title)).toEqual(['Clean Show']);
  });
});

describe('getShowDetails', () => {
  it('includes seasons count and summed total episodes, stripped summary', async () => {
    mockFetch.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/shows/1') return makeShow();
      if (endpoint === '/shows/1/seasons')
        return [
          { id: 1, number: 1, episodeOrder: 13, premiereDate: '2013-06-24', endDate: null },
          { id: 2, number: 2, episodeOrder: 13, premiereDate: '2014-06-30', endDate: null },
          { id: 3, number: 3, episodeOrder: 13, premiereDate: '2015-06-25', endDate: null },
        ];
      if (endpoint === '/shows/1/cast')
        return [
          {
            person: { name: 'Mike Vogel', image: { original: 'p.jpg' } },
            character: { name: 'Dale Barbara', image: null },
            voice: false,
          },
        ];
      return [];
    });

    const details = await getShowDetails(1);
    expect(details).not.toBeNull();
    expect(details!.seasons).toBe(3);
    expect(details!.totalEpisodes).toBe(39);
    expect(details!.overview).toBe('Under the Dome is the story of a small town.');
    expect(details!.network).toBe('CBS');
    expect(details!.imdbId).toBe('tt1553656');
    expect(details!.cast[0]).toEqual({
      name: 'Mike Vogel',
      character: 'Dale Barbara',
      profileUrl: 'p.jpg',
      voice: false,
    });
    // Live-action English drama → neither animation nor anime.
    expect(details!.isAnimation).toBe(false);
    expect(details!.isAnime).toBe(false);
  });

  it('sets isAnime for a Japanese/anime-tagged series, not for a Western cartoon', async () => {
    // Anime series: Japanese language + "Anime" tag.
    mockFetch.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/shows/2')
        return makeShow({ id: 2, name: 'Naruto', language: 'Japanese', genres: ['Anime', 'Action'] });
      return [];
    });
    const anime = await getShowDetails(2);
    expect(anime!.isAnimation).toBe(true);
    expect(anime!.isAnime).toBe(true);

    // Western cartoon: English, Animation tag, no anime studio/tag.
    mockFetch.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/shows/3')
        return makeShow({
          id: 3,
          name: 'The Simpsons',
          language: 'English',
          genres: ['Animation', 'Comedy'],
          network: { id: 5, name: 'FOX', country: { name: 'United States', code: 'US' } },
        });
      return [];
    });
    const cartoon = await getShowDetails(3);
    expect(cartoon!.isAnimation).toBe(true);
    expect(cartoon!.isAnime).toBe(false);
  });

  it('returns null for a pornographic show', async () => {
    mockFetch.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/shows/9') return makeShow({ id: 9, name: 'XXX Hardcore', summary: 'porn' });
      return [];
    });
    expect(await getShowDetails(9)).toBeNull();
  });
});

describe('getAnimationSeriesCollection', () => {
  it('returns only animation-tagged shows', async () => {
    mockFetch.mockResolvedValue([
      makeShow({ id: 1, name: 'Naruto', genres: ['Anime'], rating: { average: 8.5 } }),
      makeShow({ id: 2, name: 'Under the Dome', genres: ['Drama'], rating: { average: 6.6 } }),
    ]);
    const items = await getAnimationSeriesCollection(10);
    expect(items.every((i) => i.isAnimation)).toBe(true);
    expect(items.map((i) => i.title)).toContain('Naruto');
    expect(items.map((i) => i.title)).not.toContain('Under the Dome');
  });
});

describe('verifyShow', () => {
  it('verifies a TV pick and corrects the year via TVmaze', async () => {
    mockFetch.mockResolvedValue(makeShow({ name: 'Stranger Things', premiered: '2016-07-15' }));
    const verified = await verifyShow('Stranger Things', 2015);
    expect(verified).not.toBeNull();
    expect(verified!.title).toBe('Stranger Things');
    expect(verified!.year).toBe(2016); // corrected from the hallucinated 2015
  });

  it('rejects a non-animation match when requireAnimation is true', async () => {
    mockFetch.mockResolvedValue(makeShow({ name: 'Under the Dome', genres: ['Drama'] }));
    expect(await verifyShow('Under the Dome', 2013, true)).toBeNull();
  });

  it('accepts an animation match when requireAnimation is true', async () => {
    mockFetch.mockResolvedValue(makeShow({ name: 'Naruto', genres: ['Anime'], premiered: '2002-10-03' }));
    const verified = await verifyShow('Naruto', 2002, true);
    expect(verified).not.toBeNull();
    expect(verified!.isAnimation).toBe(true);
  });
});
