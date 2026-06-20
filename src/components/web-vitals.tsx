'use client';

import { useEffect } from 'react';

/**
 * Reports Core Web Vitals metrics to Google Analytics 4.
 * Metrics: LCP (loading), INP (interactivity), CLS (visual stability).
 *
 * Only fires when GA4 is loaded. Falls back silently otherwise.
 * Uses the web-vitals library (available via firebase transitive dep).
 */
export function WebVitals() {
  useEffect(() => {
    async function reportMetrics() {
      try {
        const { onCLS, onINP, onLCP } = await import('web-vitals');

        function sendToGA4(metric: { name: string; value: number; id: string }) {
          const w = window as unknown as { gtag?: (...args: unknown[]) => void };
          if (typeof w.gtag === 'function') {
            w.gtag('event', metric.name, {
              value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
              event_label: metric.id,
              non_interaction: true,
            });
          }
        }

        onCLS(sendToGA4);
        onINP(sendToGA4);
        onLCP(sendToGA4);
      } catch {
        // web-vitals not available — skip silently
      }
    }

    reportMetrics();
  }, []);

  return null;
}
