import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getKofiUrl, isKofiEnabled, trackKofiClick } from './kofi';

describe('kofi env-gating', () => {
  const original = process.env.NEXT_PUBLIC_KOFI_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_KOFI_URL = original;
    vi.unstubAllGlobals();
  });

  it('returns the URL when set', () => {
    process.env.NEXT_PUBLIC_KOFI_URL = 'https://ko-fi.com/cinetrivia';
    expect(getKofiUrl()).toBe('https://ko-fi.com/cinetrivia');
    expect(isKofiEnabled()).toBe(true);
  });

  it('returns null when unset', () => {
    delete process.env.NEXT_PUBLIC_KOFI_URL;
    expect(getKofiUrl()).toBeNull();
    expect(isKofiEnabled()).toBe(false);
  });
});

describe('trackKofiClick', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it('fires a GA4 event when gtag exists', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag } as unknown as Window);
    trackKofiClick('footer');
    expect(gtag).toHaveBeenCalledWith('event', 'kofi_click', { location: 'footer' });
  });

  it('does nothing when gtag is absent', () => {
    vi.stubGlobal('window', {} as unknown as Window);
    expect(() => trackKofiClick('card')).not.toThrow();
  });
});
