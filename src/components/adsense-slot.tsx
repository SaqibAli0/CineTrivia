'use client';

import { useEffect, useRef } from 'react';

interface AdSenseSlotProps {
  /** AdSense ad slot ID (from your AdSense dashboard) */
  slot: string;
  /** Ad format: auto, rectangle, horizontal, vertical */
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  /** Whether the ad should be responsive */
  responsive?: boolean;
  /** Optional className for the container */
  className?: string;
}

/**
 * Google AdSense display ad component.
 *
 * Setup:
 * 1. Sign up at https://adsense.google.com
 * 2. Get approved (requires 100+ pages of original content)
 * 3. Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in .env (e.g., "ca-pub-XXXXXXXXXXXXXXXX")
 * 4. Create ad units in AdSense dashboard and use their slot IDs here
 *
 * This component renders a placeholder until AdSense is configured.
 */
export function AdSenseSlot({ slot, format = 'auto', responsive = true, className = '' }: AdSenseSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !slot) return;

    try {
      // Push ad to AdSense queue
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [clientId, slot]);

  // Don't render anything if AdSense is not configured
  if (!clientId || !slot) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
