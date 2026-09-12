import { describe, it, expect } from 'vitest';
import { getAuthorProfile, blogPosts, getPostBySlug } from './blog';

describe('getAuthorProfile (E-E-A-T author credibility)', () => {
  it('resolves the team author to a named Organization profile with a bio', () => {
    const profile = getAuthorProfile('CineTrivia Team');
    expect(profile.name).toBe('CineTrivia Editorial Team');
    expect(profile.type).toBe('Organization');
    expect(profile.bio.length).toBeGreaterThan(30);
  });

  it('treats an unknown named author as a Person with a fallback bio', () => {
    const profile = getAuthorProfile('Jane Critic');
    expect(profile.name).toBe('Jane Critic');
    expect(profile.type).toBe('Person');
    expect(profile.bio.length).toBeGreaterThan(0);
  });
});

describe('blog data integrity', () => {
  it('every post has a resolvable author profile', () => {
    for (const post of blogPosts) {
      const profile = getAuthorProfile(post.author);
      expect(profile.name.length).toBeGreaterThan(0);
      expect(profile.bio.length).toBeGreaterThan(0);
    }
  });

  it('getPostBySlug returns the matching post', () => {
    const first = blogPosts[0];
    expect(getPostBySlug(first.slug)?.slug).toBe(first.slug);
    expect(getPostBySlug('does-not-exist')).toBeNull();
  });
});
