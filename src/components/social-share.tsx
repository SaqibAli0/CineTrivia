'use client';

import { Share2, Twitter, Facebook, Link2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

export function SocialShare({ title, url, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(!!navigator.share);
  }, []);

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
      } catch {}
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="mono-font text-parchment/40 mr-1">SHARE:</span>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-8 h-8 border border-bordercolor text-parchment/50 hover:border-terracotta hover:text-terracotta transition-all"
        aria-label="Share on Twitter/X"
      >
        <Twitter className="w-3.5 h-3.5" />
      </a>

      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-8 h-8 border border-bordercolor text-parchment/50 hover:border-terracotta hover:text-terracotta transition-all"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-3.5 h-3.5" />
      </a>

      <button
        onClick={handleCopyLink}
        className="inline-flex items-center justify-center w-8 h-8 border border-bordercolor text-parchment/50 hover:border-terracotta hover:text-terracotta transition-all"
        aria-label={copied ? 'Link copied!' : 'Copy link'}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
      </button>

      {canNativeShare && (
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center justify-center w-8 h-8 border border-bordercolor text-parchment/50 hover:border-terracotta hover:text-terracotta transition-all"
          aria-label="Share"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
