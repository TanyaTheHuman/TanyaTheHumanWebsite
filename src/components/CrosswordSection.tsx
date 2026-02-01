"use client";

import { CrosswordGrid } from "./CrosswordGrid";
import { getCrosswordData } from "@/lib/crossword-data";

export function CrosswordSection() {
  const data = getCrosswordData();

  return (
    <section className="flex flex-col gap-8 px-8 pb-12 md:flex-row md:items-start md:gap-12">
      <div className="shrink-0">
        <CrosswordGrid />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-8 md:flex-row md:gap-12">
        <div>
          <h3 className="mb-2 font-serif text-sm font-medium text-ink">
            Across
          </h3>
          <ul className="list-inside list-decimal space-y-1 font-serif text-sm text-ink">
            {data.acrossWords.map((word) => (
              <li key={word.id}>{word.clue}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-serif text-sm font-medium text-ink">
            Down
          </h3>
          <ul className="list-inside list-decimal space-y-1 font-serif text-sm text-ink">
            {data.downWords.map((word) => (
              <li key={word.id}>{word.clue}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
