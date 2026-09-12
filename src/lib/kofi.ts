/**
 * Ko-fi support widget helpers.
 *
 * Kept separate from the React component so the env-gating and GA4 logic are
 * unit-testable without a DOM renderer.
 */

/** The configured Ko-fi URL, or null when unset (widget renders nothing). */
export function getKofiUrl(): string | null {
  return process.env.NEXT_PUBLIC_KOFI_URL || null;
}

/** Whether the Ko-fi widget should render at all. */
export function isKofiEnabled(): boolean {
  return getKofiUrl() !== null;
}

/** Fire a GA4 `kofi_click` event when gtag is available. */
export function trackKofiClick(location: string): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    w.gtag('event', 'kofi_click', { location });
  }
}
