"use client";

import { CrosswordGrid } from "./CrosswordGrid";
import { getCrosswordData } from "@/lib/crossword-data";

/* =============================================================================
   GRAIN PREVIEW CONTROLS (disabled)
   =============================================================================
   To re-enable the grain preview and sliders for testing:
   1. Uncomment the useState import above
   2. Uncomment the state variables and preview JSX below
   3. The preview block will appear above the crossword grid
   ============================================================================= */

export function CrosswordSection() {
  const data = getCrosswordData();
  
  // UNCOMMENT TO ENABLE GRAIN PREVIEW:
  // import { useState } from "react"; // Add to imports at top
  // const [dotSpacing, setDotSpacing] = useState(4);
  // const [dotSize, setDotSize] = useState(0.5);
  // const [dotOpacity, setDotOpacity] = useState(0.3);
  // const [dotCount, setDotCount] = useState(8);

  return (
    <section className="flex flex-col gap-8 px-8 pb-12 md:flex-row md:items-start md:gap-12">
      <div className="shrink-0">
        {/* GRAIN PREVIEW - UNCOMMENT TO ENABLE
        <div className="mb-4 p-4 bg-stone-100 rounded text-sm font-sans" style={{ width: 300 }}>
          <h4 className="font-semibold mb-3">Dot Pattern Controls</h4>
          <div className="mb-3">
            <label className="block text-xs text-stone-600 mb-1">Dot Spacing: {dotSpacing}px</label>
            <input type="range" min="2" max="20" step="1" value={dotSpacing}
              onChange={(e) => setDotSpacing(parseInt(e.target.value))} className="w-full"/>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-stone-600 mb-1">Dot Size: {dotSize.toFixed(2)}px</label>
            <input type="range" min="0.1" max="3" step="0.1" value={dotSize}
              onChange={(e) => setDotSize(parseFloat(e.target.value))} className="w-full"/>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-stone-600 mb-1">Dot Opacity: {(dotOpacity * 100).toFixed(0)}%</label>
            <input type="range" min="0.05" max="1" step="0.05" value={dotOpacity}
              onChange={(e) => setDotOpacity(parseFloat(e.target.value))} className="w-full"/>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-stone-600 mb-1">Dots per Tile: {dotCount}</label>
            <input type="range" min="2" max="20" step="1" value={dotCount}
              onChange={(e) => setDotCount(parseInt(e.target.value))} className="w-full"/>
          </div>
          <div className="text-xs text-stone-500 mt-2 p-2 bg-white rounded font-mono">
            dotSpacing: {dotSpacing}, dotSize: {dotSize}, dotOpacity: {dotOpacity}, dotCount: {dotCount}
          </div>
        </div>
        <div className="mb-4">
          <div style={{ width: 200, height: 200, position: "relative", border: "1px solid #ccc" }}>
            <svg width="200" height="200" style={{ position: "absolute", top: 0, left: 0 }}>
              <rect width="200" height="200" fill="#EAE8E1"/>
              {Array.from({ length: dotCount * 50 }, (_, i) => {
                const hash = (n: number, seed: number) => { const x = Math.sin(n * seed) * 10000; return x - Math.floor(x); };
                const px = hash(i, 1.1) * 200, py = hash(i, 2.3) * 200, isWhite = hash(i, 3.7) < 0.3;
                const sizeMultiplier = 0.1 + hash(i, 4.9) * 2;
                const rx = dotSize * sizeMultiplier * (dotSpacing / 3), ry = rx * (0.2 + hash(i, 5.3) * 1.6);
                return <ellipse key={i} cx={px} cy={py} rx={Math.max(0.15, rx)} ry={Math.max(0.15, ry)}
                  fill={isWhite ? "#ffffff" : "#57534e"} 
                  opacity={dotOpacity * (isWhite ? 0.3 + hash(i, 7.1) * 0.3 : 0.4 + hash(i, 8.9) * 0.6)}
                  transform={`rotate(${hash(i, 6.7) * 180} ${px} ${py})`}/>;
              })}
            </svg>
          </div>
        </div>
        */}
        
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
