"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getMovieFunFact } from "@/app/actions";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

export function FunFactButton({ movieTitle }: { movieTitle: string }) {
  const [facts, setFacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFacts = async () => {
    setIsLoading(true);
    setError("");
    const newFacts: string[] = [];

    try {
      // Fetch 4 fun facts in parallel
      const results = await Promise.allSettled([
        getMovieFunFact({ movieTitle, skipCache: facts.length > 0 }),
        getMovieFunFact({ movieTitle, skipCache: true }),
        getMovieFunFact({ movieTitle, skipCache: true }),
        getMovieFunFact({ movieTitle, skipCache: true }),
      ]);

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.funFact) {
          newFacts.push(result.value.funFact);
        }
      }

      if (newFacts.length === 0) {
        setError("Could not fetch fun facts. Please try again.");
      } else {
        setFacts(newFacts);
      }
    } catch (e: any) {
      setError(e.message || "Could not fetch fun facts.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet onOpenChange={(open) => { if (!open) { setFacts([]); setError(""); } }}>
      <SheetTrigger asChild>
        <Button variant="outline" onClick={() => { if (facts.length === 0) loadFacts(); }}>
          <Sparkles className="mr-1" />
          Fun Facts
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[480px] bg-charcoal border-l border-bordercolor p-0 overflow-y-auto">
        <SheetTitle className="sr-only">{movieTitle} Fun Facts</SheetTitle>
        {/* Header */}
        <div className="px-6 py-5 border-b border-bordercolor sticky top-0 bg-charcoal z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="display-font text-2xl text-parchment">{movieTitle}</div>
              <p className="mono-font text-terracotta mt-1">Trivia & behind the scenes</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-terracotta mb-3" />
              <p className="mono-font text-parchment/60">RETRIEVING FACTS...</p>
            </div>
          )}

          {error && (
            <div className="spec-card p-4 text-center">
              <p className="mono-font text-red-400 text-[11px]">{error}</p>
            </div>
          )}

          {!isLoading && facts.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-3">
                {facts.map((fact, i) => (
                  <div key={i} className="spec-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="mono-font text-terracotta shrink-0 mt-0.5">
                        #{String(i + 1).padStart(2, '0')}
                      </div>
                      <p className="mono-font text-parchment/80 text-[11px] leading-relaxed">
                        {fact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Refresh button */}
              <div className="pt-4 border-t border-bordercolor">
                <Button
                  onClick={loadFacts}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="mr-1 animate-spin" /> : <RefreshCw className="mr-1" />}
                  Refresh Facts
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
