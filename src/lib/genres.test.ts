import { describe, it, expect } from 'vitest';
import { genreSlug, getGenreBySlug } from './genres';

describe('genreSlug', () => {
  it('uses the canonical GENRES slug for known genres (case-insensitive)', () => {
    expect(genreSlug('Sci-Fi')).toBe('sci-fi');
    expect(genreSlug('animation')).toBe('animation');
    expect(genreSlug('Action')).toBe('action');
  });

  it('falls back to lowercase-hyphenated for unknown tags', () => {
    expect(genreSlug('Science Fiction')).toBe('science-fiction');
    expect(genreSlug('Slice of Life')).toBe('slice-of-life');
  });

  it('round-trips a known slug through getGenreBySlug', () => {
    expect(getGenreBySlug(genreSlug('Animation'))?.name).toBe('Animation');
  });
});
