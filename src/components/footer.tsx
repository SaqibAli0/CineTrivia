import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-bordercolor bg-black/40 py-8 px-6 mt-12 relative z-10">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-terracotta rounded-full animate-pulse" />
          <div className="mono-font text-parchment/60">
            © 2025 CineTrivia<br />
            All rights reserved
          </div>
        </div>

        {/* Center */}
        <div className="display-font text-2xl text-parchment/20 tracking-widest text-center">
          CineTrivia
        </div>

        {/* Right */}
        <div className="flex gap-6 mono-font !text-[14px] text-parchment/40 text-right">
          <Link href="/" className="hover:text-terracotta transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-terracotta transition-colors">Privacy</Link>
          <Link href="/about" className="hover:text-terracotta transition-colors">About</Link>
        </div>
      </div>
    </footer>
  );
}
