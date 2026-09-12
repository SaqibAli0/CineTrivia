import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * affiliate.ts reads NEXT_PUBLIC_* env vars at module load, so each test sets
 * env then re-imports the module fresh.
 */
async function freshAffiliate() {
  vi.resetModules();
  return import('./affiliate');
}

describe('getAffiliateUrl', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID;
    delete process.env.NEXT_PUBLIC_APPLE_AFFILIATE_TOKEN;
    delete process.env.NEXT_PUBLIC_IMPACT_SUBID;
    delete process.env.NEXT_PUBLIC_FANDANGO_AFFILIATE_ID;
  });

  it('adds the Amazon tag when configured', async () => {
    process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID = 'mytag-20';
    const { getAffiliateUrl, hasAffiliateTracking } = await freshAffiliate();
    const url = getAffiliateUrl('Amazon Prime Video', 'Inception', 2010);
    expect(url).toContain('tag=mytag-20');
    expect(hasAffiliateTracking('Amazon Prime Video')).toBe(true);
  });

  it('produces a working untracked Amazon link when not configured', async () => {
    const { getAffiliateUrl, hasAffiliateTracking } = await freshAffiliate();
    const url = getAffiliateUrl('Amazon Prime Video', 'Inception', 2010);
    expect(url).toContain('amazon.com/s?k=');
    expect(url).not.toContain('tag=');
    expect(hasAffiliateTracking('Amazon Prime Video')).toBe(false);
  });

  it('appends the Impact sub-id to partner links when configured', async () => {
    process.env.NEXT_PUBLIC_IMPACT_SUBID = 'sub123';
    const { getAffiliateUrl, hasAffiliateTracking } = await freshAffiliate();
    const url = getAffiliateUrl('Paramount+', 'Top Gun', 1986);
    expect(url).toContain('subId1=sub123');
    expect(hasAffiliateTracking('Paramount+')).toBe(true);
  });

  it('keeps non-affiliate providers as plain search links', async () => {
    const { getAffiliateUrl, hasAffiliateTracking } = await freshAffiliate();
    const url = getAffiliateUrl('Netflix', 'The Irishman', 2019);
    expect(url).toContain('netflix.com/search?q=');
    expect(hasAffiliateTracking('Netflix')).toBe(false);
  });

  it('falls back to a Google search for unknown providers', async () => {
    const { getAffiliateUrl } = await freshAffiliate();
    const url = getAffiliateUrl('SomeNewService', 'A Movie', 2020);
    expect(url).toContain('google.com/search?q=');
  });
});

describe('trackAffiliateClick', () => {
  it('fires a GA4 event when gtag exists', async () => {
    const { trackAffiliateClick } = await freshAffiliate();
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag } as unknown as Window);
    trackAffiliateClick('Netflix', 'Movie', 2020);
    expect(gtag).toHaveBeenCalledWith('event', 'affiliate_click', {
      provider: 'Netflix',
      movie_title: 'Movie',
      movie_year: 2020,
    });
    vi.unstubAllGlobals();
  });
});
