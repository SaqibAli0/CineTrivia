"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getMovieFunFact } from "@/app/actions";
import { Loader2, Sparkles } from "lucide-react";

export function FunFactButton({ movieTitle }: { movieTitle: string }) {
  const [fact, setFact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetFact = async () => {
    setIsLoading(true);
    setFact("");
    setError("");
    try {
      const result = await getMovieFunFact({ movieTitle });
      setFact(result.funFact);
    } catch (e) {
      setError("Could not fetch a fun fact. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) { setFact(''); setError(''); }}}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Fun Fact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]" onOpenAutoFocus={handleGetFact}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Fun Fact about {movieTitle}</DialogTitle>
        </DialogHeader>
        <div className="min-h-[100px] flex items-center justify-center px-2">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {error && <p className="text-destructive text-center">{error}</p>}
          {fact && <p className="text-center text-base leading-relaxed">{fact}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleGetFact} disabled={isLoading} className="rounded-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Get Another Fact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
