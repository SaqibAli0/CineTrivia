import { describe, it, expect } from 'vitest';
import { isAnime, mediaLabel, buildMetaCopy } from './media-classify';

describe('isAnime', () => {
  it('classifies a Japanese-language animated film as anime', () => {
    // "Your Name" — TMDB animation genre, Japanese spoken language.
    expect(
      isAnime({ isAnimation: true, language: 'Japanese', genres: ['Animation', 'Romance'] })
    ).toBe(true);
    // ISO code form works too.
    expect(isAnime({ isAnimation: true, language: 'ja', genres: ['Animation'] })).toBe(true);
  });

  it('classifies an explicit "Anime" TVmaze tag as anime', () => {
    // No language/studio needed — the tag alone is decisive. `isAnimation`
    // omitted to prove the tag implies animation.
    expect(isAnime({ genres: ['Anime', 'Action'] })).toBe(true);
    expect(isAnime({ isAnimation: true, language: 'English', genres: ['Anime'] })).toBe(true);
  });

  it('classifies a known anime studio (Ghibli) without a tag as anime', () => {
    expect(
      isAnime({ isAnimation: true, genres: ['Animation', 'Fantasy'], studios: ['Studio Ghibli, Inc.'] })
    ).toBe(true);
    // single-studio form
    expect(isAnime({ isAnimation: true, genres: ['Animation'], studio: 'MAPPA' })).toBe(true);
  });

  it('does NOT classify a Western animated film (Pixar, English) as anime', () => {
    expect(
      isAnime({
        isAnimation: true,
        language: 'English',
        genres: ['Animation', 'Family'],
        studios: ['Pixar', 'Walt Disney Pictures'],
      })
    ).toBe(false);
  });

  it('does NOT classify a live-action drama as anime', () => {
    expect(
      isAnime({ isAnimation: false, language: 'Japanese', genres: ['Drama'], studios: ['Toei'] })
    ).toBe(false);
    // With no animation signal at all, also false.
    expect(isAnime({ language: 'Japanese', genres: ['Drama'] })).toBe(false);
  });
});

describe('mediaLabel', () => {
  it('returns anime nouns + keywords for anime kinds', () => {
    const series = mediaLabel('anime-series');
    expect(series.noun).toBe('anime');
    expect(series.headingNoun).toBe('Anime');
    expect(series.keywords).toContain('anime');
    expect(series.keywords).toContain('watch anime online');
    expect(series.keywords).toContain('subbed and dubbed');

    const film = mediaLabel('anime-film');
    expect(film.headingNoun).toBe('Anime');
    expect(film.keywords).toContain('anime');
  });

  it('returns type-correct nouns for movie / tv / animated-film', () => {
    expect(mediaLabel('movie').noun).toBe('movie');
    expect(mediaLabel('movie').headingNoun).toBe('Movie');
    expect(mediaLabel('tv').noun).toBe('TV series');
    expect(mediaLabel('tv').headingNoun).toBe('Show');
    expect(mediaLabel('animated-film').noun).toBe('animated film');
    expect(mediaLabel('animated-film').headingNoun).toBe('Animation');
  });
});

describe('buildMetaCopy', () => {
  it('produces anime-worded title + keywords for an anime film', () => {
    const { title, description } = buildMetaCopy({
      kind: 'anime-film',
      title: 'Your Name',
      year: 2016,
      overview: 'Two teenagers share a profound, magical connection.',
    });
    expect(title).toBe('Your Name (2016) — Anime Facts & Where to Watch');
    expect(description.toLowerCase()).toContain('your name anime');
    expect(description.toLowerCase()).toContain('subbed and dubbed');
  });

  it('produces anime-series title mentioning episodes', () => {
    const { title } = buildMetaCopy({ kind: 'anime-series', title: 'Naruto', year: 2002 });
    expect(title).toBe('Naruto (2002) — Anime Facts, Episodes & Where to Watch');
  });

  it('keeps Animation wording for a non-anime animated film', () => {
    const { title, description } = buildMetaCopy({
      kind: 'animated-film',
      title: 'Toy Story',
      year: 1995,
      overview: 'A cowboy doll is threatened by a new spaceman figure.',
    });
    expect(title).toBe('Toy Story (1995) — Animation Facts & Where to Watch');
    expect(title.toLowerCase()).not.toContain('anime');
    expect(description.toLowerCase()).toContain('animated film');
  });

  it('uses Movie / TV Series wording for those kinds', () => {
    expect(buildMetaCopy({ kind: 'movie', title: 'Inception', year: 2010 }).title).toBe(
      'Inception (2010) — Movie Facts & Where to Watch'
    );
    expect(buildMetaCopy({ kind: 'tv', title: 'Stranger Things', year: 2016 }).title).toBe(
      'Stranger Things (2016) — TV Series Facts, Episodes & Where to Watch'
    );
  });
});
