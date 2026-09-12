import { describe, it, expect } from 'vitest';
import { toSlug, fromSlug, slugifyTitle } from './slug';

describe('toSlug — diacritics (the "Léon" bug)', () => {
  it('transliterates accented Latin letters instead of deleting them', () => {
    expect(toSlug('Léon: The Professional', 1994)).toBe('leon-the-professional-1994');
    expect(toSlug('Amélie', 2001)).toBe('amelie-2001');
    expect(toSlug('WALL·E', 2008)).toBe('wall-e-2008');
  });

  it('does NOT produce the old buggy "lon" slug', () => {
    expect(toSlug('Léon', 1994)).not.toBe('lon-1994');
    expect(toSlug('Léon', 1994)).toBe('leon-1994');
  });
});

describe('toSlug — general normalization', () => {
  it('handles apostrophes (straight and curly)', () => {
    expect(toSlug("Schindler's List", 1993)).toBe('schindlers-list-1993');
    expect(toSlug('Ocean\u2019s Eleven', 2001)).toBe('oceans-eleven-2001');
  });

  it('replaces ampersands with "and"', () => {
    expect(toSlug('Fast & Furious', 2001)).toBe('fast-and-furious-2001');
  });

  it('collapses whitespace and trims hyphens', () => {
    expect(toSlug('  The   Dark   Knight  ', 2008)).toBe('the-dark-knight-2008');
  });

  it('handles a plain title', () => {
    expect(toSlug('Inception', 2010)).toBe('inception-2010');
  });
});

describe('slugifyTitle', () => {
  it('produces the base slug without the year', () => {
    expect(slugifyTitle('Léon: The Professional')).toBe('leon-the-professional');
  });
});

describe('fromSlug', () => {
  it('extracts an approximate title and year', () => {
    expect(fromSlug('the-dark-knight-2008')).toEqual({
      title: 'The Dark Knight',
      year: 2008,
    });
  });

  it('returns null for malformed slugs', () => {
    expect(fromSlug('no-year-here')).toBeNull();
    expect(fromSlug('')).toBeNull();
  });

  it('rejects out-of-range years', () => {
    expect(fromSlug('some-movie-1700')).toBeNull();
    expect(fromSlug('some-movie-3000')).toBeNull();
  });
});

describe('round-trip (fixed slugs still parse back to a usable title)', () => {
  it('leon slug parses to a title findMovieId can search', () => {
    const slug = toSlug('Léon: The Professional', 1994);
    const parsed = fromSlug(slug);
    expect(parsed).not.toBeNull();
    expect(parsed!.year).toBe(1994);
    // ASCII-normalized title; findMovieId's title search resolves the accented film.
    expect(parsed!.title).toBe('Leon The Professional');
  });
});

describe('tmdb-details no longer duplicates the buggy slug transform', () => {
  it('does not contain the raw ASCII-strip block', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const path = fileURLToPath(new URL('./tmdb-details.ts', import.meta.url));
    const source = readFileSync(path, 'utf8');
    // The old buggy inline transform stripped non-ASCII before normalizing.
    expect(source).not.toMatch(/\.replace\(\/\[\^a-z0-9\\s-\]\/g/);
    // It should import the shared slug helper instead.
    expect(source).toMatch(/from '\.\/slug'/);
  });
});
