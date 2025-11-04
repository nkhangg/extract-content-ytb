"use client";

import { Search, Filter } from "lucide-react";

interface SearchPromptProps {
  title?: string;
  description?: string;
  showFilterIcon?: boolean;
  resultHint?: string;
}

export function SearchPrompt({
  title = "Ready to Search",
  description = "Please enter a search or filter to show results that match you",
  showFilterIcon = true,
  resultHint,
}: SearchPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 md:p-8 rounded-full">
          <div className="flex items-center justify-center gap-2">
            <Search
              className="h-10 w-10 md:h-12 md:w-12 text-primary"
              strokeWidth={1.5}
            />
            {showFilterIcon && (
              <>
                <div className="h-8 w-px bg-primary/30" />
                <Filter
                  className="h-8 w-8 md:h-10 md:w-10 text-primary"
                  strokeWidth={1.5}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
        {description}
      </p>

      {/* Result hint line */}
      {resultHint && (
        <p className="mt-2 text-xs md:text-sm text-muted-foreground/70">
          {resultHint}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
        </div>
        <span className="text-muted-foreground/50">or</span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
        </div>
      </div>
    </div>
  );
}
