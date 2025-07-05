import { Clapperboard } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
      <Clapperboard className="w-10 h-10 md:w-12 md:h-12 text-primary" />
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
        CineTrivia
      </h1>
    </header>
  );
}
