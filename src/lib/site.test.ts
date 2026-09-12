import { describe, it, expect, afterEach, vi } from 'vitest';

async function freshSite() {
  vi.resetModules();
  return import('./site');
}

describe('SITE_URL', () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;
  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it('uses the env var when set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    const { SITE_URL } = await freshSite();
    expect(SITE_URL).toBe('https://example.com');
  });

  it('falls back to the real production domain (not a per-deploy subdomain)', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const { SITE_URL } = await freshSite();
    expect(SITE_URL).toBe('https://cinetrivia.netlify.app');
    expect(SITE_URL).not.toContain('classy-bublanina');
  });
});

describe('SOCIAL_PROFILES', () => {
  const keys = [
    'NEXT_PUBLIC_TWITTER_URL',
    'NEXT_PUBLIC_INSTAGRAM_URL',
    'NEXT_PUBLIC_FACEBOOK_URL',
    'NEXT_PUBLIC_GITHUB_URL',
  ];
  afterEach(() => {
    keys.forEach((k) => delete process.env[k]);
  });

  it('is empty when no profiles are configured', async () => {
    keys.forEach((k) => delete process.env[k]);
    const { SOCIAL_PROFILES } = await freshSite();
    expect(SOCIAL_PROFILES).toEqual([]);
  });

  it('includes only the configured (non-empty) profiles', async () => {
    process.env.NEXT_PUBLIC_TWITTER_URL = 'https://x.com/cinetrivia';
    process.env.NEXT_PUBLIC_GITHUB_URL = '   ';
    const { SOCIAL_PROFILES } = await freshSite();
    expect(SOCIAL_PROFILES).toEqual(['https://x.com/cinetrivia']);
  });
});
