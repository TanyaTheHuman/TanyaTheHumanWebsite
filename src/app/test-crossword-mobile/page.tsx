"use client";

import { CrosswordInteractive } from "@/components/CrosswordSection";

export default function TestCrosswordMobilePage() {
  return (
    <div className="bg-cream min-h-screen [-webkit-overflow-scrolling:touch]">
      <div className="px-6 pt-8 pb-6">
        <h1 className="mb-2 font-serif text-xl text-stone-800">
          Chevron scroll fix test
        </h1>
        <p className="mb-6 max-w-md text-base text-stone-600">
          On mobile: tap a cell to select, then use the left/right chevrons to
          navigate between words. The grid should no longer jump down and back
          up when using the chevrons.
        </p>
        <div className="flex justify-center">
          <CrosswordInteractive />
        </div>
      </div>
    </div>
  );
}
