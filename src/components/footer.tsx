import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 sm:py-8 mt-10 sm:mt-16">
      <div className="flex flex-col gap-4 text-xs sm:text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2025 CineTrivia. All rights reserved.</p>
          <nav className="flex flex-wrap gap-4" aria-label="Footer navigation">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </nav>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/50">
          CineTrivia is a participant in affiliate programs including Amazon Associates. 
          Some links on this site are affiliate links, meaning we may earn a small commission 
          at no extra cost to you when you make a purchase through our links.
        </p>
      </div>
    </footer>
  );
}
