'use client';

import { Share2, Twitter, Facebook, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

/**
 * Social share buttons for movie pages.
 * Allows users to share movie pages on Twitter/X, Facebook, or copy the link.
 */
export function SocialShare({ title, url, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareText = description
    ? `${title} — ${description}`
    : `Check out ${title} on CineTrivia!`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch {
        // User cancelled or share failed — no action needed
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">Share:</span>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border hover:border-primary/40 hover:text-primary transition-all"
        aria-label="Share on Twitter/X"
      >
        <Twitter className="w-3.5 h-3.5" />
      </a>

      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border hover:border-primary/40 hover:text-primary transition-all"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-3.5 h-3.5" />
      </a>

      <button
        onClick={handleCopyLink}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border hover:border-primary/40 hover:text-primary transition-all"
        aria-label={copied ? 'Link copied!' : 'Copy link'}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
      </button>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border hover:border-primary/40 hover:text-primary transition-all"
          aria-label="Share"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
