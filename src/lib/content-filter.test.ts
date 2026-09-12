import { describe, it, expect } from 'vitest';
import { isPornographic, filterExplicit } from './content-filter';

describe('isPornographic — removes hardcore / porn parody', () => {
  it('drops titles flagged adult by TMDB', () => {
    expect(isPornographic({ title: 'Some Film', adult: true })).toBe(true);
  });

  it('drops explicit "XXX Parody" titles', () => {
    expect(isPornographic({ title: 'The Avengers XXX: A Porn Parody' })).toBe(true);
    expect(isPornographic({ title: 'Batman v Superman: A XXX Parody' })).toBe(true);
    expect(isPornographic({ title: 'Star Wars XXX' })).toBe(true);
  });

  it('drops obvious pornographic keywords', () => {
    expect(isPornographic({ title: 'Hardcore Porn Compilation' })).toBe(true);
    expect(isPornographic({ title: 'Naughty MILF Adventures' })).toBe(true);
    expect(isPornographic({ title: 'Hentai Dreams' })).toBe(true);
    expect(isPornographic({ title: 'Gangbang Party 3' })).toBe(true);
  });

  it('drops softcore / sexploitation parodies', () => {
    expect(isPornographic({ title: 'Bikini Avengers' })).toBe(true);
    expect(isPornographic({ title: 'Erotic Confessions' })).toBe(true);
    expect(isPornographic({ title: 'Softcore Summer' })).toBe(true);
    expect(isPornographic({ title: 'Playboy: The Mansion' })).toBe(true);
    expect(isPornographic({ title: 'Nude Coeds Spring Break' })).toBe(true);
  });

  it('matches on overview text too', () => {
    expect(
      isPornographic({
        title: 'Innocent Sounding Title',
        overview: 'A hardcore pornographic feature starring adult performers.',
      })
    ).toBe(true);
  });
});

describe('isPornographic — KEEPS legitimate R-rated films', () => {
  const legit = [
    { title: 'Sex, Lies, and Videotape' },
    { title: 'Eyes Wide Shut' },
    { title: 'Basic Instinct' },
    { title: 'American Pie' },
    { title: 'Blue Is the Warmest Color' },
    { title: 'Fifty Shades of Grey' },
    { title: 'Shame', overview: 'A man struggles with sex addiction in New York.' },
    { title: 'Love Actually' },
    { title: 'The 40-Year-Old Virgin' },
    { title: 'Naked', overview: 'A drifter wanders London.' },
    { title: 'Killing Them Softly', overview: 'Violent crime thriller.' },
    { title: 'Sex Tape', overview: 'A married couple accidentally records themselves.' },
  ];

  it.each(legit)('keeps "%s"', (movie) => {
    expect(isPornographic(movie)).toBe(false);
  });
});

describe('filterExplicit', () => {
  it('removes only the pornographic entries', () => {
    const input = [
      { id: 1, title: 'Inception' },
      { id: 2, title: 'The Matrix XXX: A Porn Parody' },
      { id: 3, title: 'Eyes Wide Shut' },
      { id: 4, title: 'Hardcore Porn 5', adult: true },
    ];
    const out = filterExplicit(input);
    expect(out.map((m) => m.id)).toEqual([1, 3]);
  });
});
