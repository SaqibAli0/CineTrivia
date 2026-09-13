import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./site', () => ({
  SITE_URL: 'https://cinetrivia.netlify.app',
  INDEXNOW_KEY: 'testkey123',
}));

import { pingIndexNow } from './indexnow';

describe('pingIndexNow', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('submits only same-host URLs and posts the correct payload', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('', { status: 200 }));

    const res = await pingIndexNow([
      'https://cinetrivia.netlify.app/tv/stranger-things-2016',
      'https://evil.example.com/x', // cross-host → dropped
      'not-a-url', // invalid → dropped
    ]);

    expect(res.ok).toBe(true);
    expect(res.submitted).toBe(1);

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.host).toBe('cinetrivia.netlify.app');
    expect(body.key).toBe('testkey123');
    expect(body.keyLocation).toBe('https://cinetrivia.netlify.app/testkey123.txt');
    expect(body.urlList).toEqual(['https://cinetrivia.netlify.app/tv/stranger-things-2016']);
  });

  it('skips when there are no valid same-host URLs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const res = await pingIndexNow(['https://other.com/a']);
    expect(res.ok).toBe(false);
    expect(res.submitted).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('dedupes repeated URLs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 202 }));
    const url = 'https://cinetrivia.netlify.app/animation/naruto-2002';
    const res = await pingIndexNow([url, url, url]);
    expect(res.submitted).toBe(1);
    expect(res.ok).toBe(true);
  });
});
