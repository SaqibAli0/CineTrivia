import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tvmazeFetch, TVmazeHttpError, TVmazeUnreachableError } from './tvmaze-client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('tvmazeFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Speed up backoff/timeout sleeps.
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void) => {
      fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as unknown as typeof setTimeout);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds the request URL with params and parses JSON', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ id: 1, name: 'Under the Dome' })
    );

    const data = await tvmazeFetch<{ id: number; name: string }>('/shows/1');
    expect(data.name).toBe('Under the Dome');

    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toBe('https://api.tvmaze.com/shows/1');
  });

  it('encodes query params', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]));
    await tvmazeFetch('/search/shows', { params: { q: 'stranger things' } });
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain('q=stranger+things');
  });

  it('sends a descriptive User-Agent', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}));
    await tvmazeFetch('/shows/1');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['User-Agent']).toMatch(/CineTrivia/);
  });

  it('maps a non-ok response to TVmazeHttpError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 404));
    await expect(tvmazeFetch('/shows/999999999')).rejects.toBeInstanceOf(TVmazeHttpError);
  });

  it('retries network failures then throws TVmazeUnreachableError', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('network down'));
    await expect(tvmazeFetch('/shows/1', { maxAttempts: 3 })).rejects.toBeInstanceOf(
      TVmazeUnreachableError
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('backs off on 429 then succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(jsonResponse({ id: 1, name: 'OK' }));

    const data = await tvmazeFetch<{ name: string }>('/shows/1');
    expect(data.name).toBe('OK');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('adds Basic auth header only when TVMAZE_API_KEY is set', async () => {
    // Fresh Response per call — a Response body can only be read once.
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => jsonResponse({}));

    // No key → no Authorization header.
    delete process.env.TVMAZE_API_KEY;
    await tvmazeFetch('/shows/1');
    let headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();

    // Key set → Basic auth present, key not exposed verbatim.
    process.env.TVMAZE_API_KEY = 'secret-key';
    await tvmazeFetch('/shows/1');
    headers = (fetchMock.mock.calls[1][1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toMatch(/^Basic /);
    expect(headers.Authorization).not.toContain('secret-key');
    delete process.env.TVMAZE_API_KEY;
  });
});
