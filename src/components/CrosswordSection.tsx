"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { CrosswordGrid } from "./CrosswordGrid";
import { getCrosswordData } from "@/lib/crossword-data";
import { getFirstCell } from "@/lib/crossword-navigation";

/* =============================================================================
   GRAIN PREVIEW CONTROLS (disabled)
   =============================================================================
   To re-enable the grain preview and sliders for testing:
   1. Uncomment the state variables and preview JSX below
   2. The preview block will appear above the crossword grid
   ============================================================================= */

export function CrosswordSection() {
  const data = useMemo(() => getCrosswordData(), []);
  const firstCell = useMemo(() => getFirstCell(data), [data]);
  
  // Selection state with direction tracking
  const [selection, setSelection] = useState<{
    row: number;
    col: number;
    direction: "across" | "down";
  } | null>(() => firstCell ? { ...firstCell, direction: "across" } : null);
  
  // Toggle for showing/hiding answers (dev only, default off)
  const [showAnswers, setShowAnswers] = useState(false);
  
  // User input state: maps "row,col" to the letter entered by user
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  
  // Scroll state for clue lists (to show border under sticky headers)
  const [acrossScrolled, setAcrossScrolled] = useState(false);
  const [downScrolled, setDownScrolled] = useState(false);
  const acrossListRef = useRef<HTMLDivElement>(null);
  const downListRef = useRef<HTMLDivElement>(null);
  
  const handleAcrossScroll = useCallback(() => {
    if (acrossListRef.current) {
      setAcrossScrolled(acrossListRef.current.scrollTop > 0);
    }
  }, []);
  
  const handleDownScroll = useCallback(() => {
    if (downListRef.current) {
      setDownScrolled(downListRef.current.scrollTop > 0);
    }
  }, []);
  
  const handleInputLetter = useCallback((row: number, col: number, letter: string) => {
    setUserInputs(prev => ({
      ...prev,
      [`${row},${col}`]: letter.toUpperCase()
    }));
  }, []);
  
  const handleClearCell = useCallback((row: number, col: number) => {
    setUserInputs(prev => {
      const next = { ...prev };
      delete next[`${row},${col}`];
      return next;
    });
  }, []);
  
  const handleSelectCell = useCallback((row: number, col: number, direction: "across" | "down") => {
    setSelection({ row, col, direction });
  }, []);
  
  // Determine which word(s) the selected cell belongs to
  const activeWordIds = useMemo(() => {
    if (!selection) return { acrossId: null as number | null, downId: null as number | null, activeType: "across" as const };
    
    const cell = data.cells[selection.row]?.[selection.col];
    if (!cell || cell.type === "black") return { acrossId: null, downId: null, activeType: selection.direction };
    
    const acrossId = cell.acrossWordId ?? null;
    const downId = cell.downWordId ?? null;
    
    // Use the tracked direction from selection state
    return { acrossId, downId, activeType: selection.direction };
  }, [data, selection]);
  
  // Sort words by clue number for display
  const sortedAcrossWords = useMemo(
    () => [...data.acrossWords].sort((a, b) => a.clueNumber - b.clueNumber),
    [data.acrossWords]
  );
  const sortedDownWords = useMemo(
    () => [...data.downWords].sort((a, b) => a.clueNumber - b.clueNumber),
    [data.downWords]
  );
  
  // UNCOMMENT TO ENABLE GRAIN PREVIEW:
  // const [dotSpacing, setDotSpacing] = useState(4);
  // const [dotSize, setDotSize] = useState(0.5);
  // const [dotOpacity, setDotOpacity] = useState(0.3);
  // const [dotCount, setDotCount] = useState(8);

  return (
    <section className="w-full flex justify-center px-8" style={{ paddingTop: 200, paddingBottom: 200 }}>
      <div className="flex flex-col gap-8 md:flex-row md:items-start" style={{ gap: 32 }}>
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
        
        <CrosswordGrid 
          data={data} 
          selectedCell={selection ? { row: selection.row, col: selection.col } : null}
          direction={selection?.direction ?? "across"}
          showAnswers={showAnswers}
          userInputs={userInputs}
          onSelectCell={handleSelectCell}
          onInputLetter={handleInputLetter}
          onClearCell={handleClearCell}
        />
        
        {/* DEV ONLY: Show/Hide Answers Toggle - only visible in development mode */}
        {process.env.NODE_ENV === 'development' && (
          <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={showAnswers}
                onChange={(e) => setShowAnswers(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-300 rounded-full peer peer-checked:bg-mustard-400 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="font-serif text-sm text-ink">Show answers (dev only)</span>
          </label>
        )}
      </div>

        <div className="flex flex-col md:flex-row" style={{ 
          gap: 24,
          borderBottom: "1px solid var(--stone-800, #292524)",
        }}>
          <div 
            ref={acrossListRef}
            onScroll={handleAcrossScroll}
            className={`clue-list-container ${acrossScrolled ? "clue-list-scrolled" : ""}`}
            style={{ 
              maxWidth: 250,
              maxHeight: 707, // Match crossword grid height
              overflowY: "auto",
            }}
          >
            <h3 className="clue-list-header" style={{
              position: "sticky",
              top: 0,
              backgroundColor: "var(--paper, #EAE8E1)",
              color: "var(--stone-800, #292524)",
              fontFeatureSettings: "'dlig' on, 'hlig' on",
              fontFamily: '"EB Garamond", serif',
              fontSize: 20,
              fontStyle: "italic",
              fontWeight: 500,
              lineHeight: "normal",
              letterSpacing: -0.4,
              paddingBottom: 16,
              paddingLeft: 6,
              marginBottom: 0,
              zIndex: 1,
            }}>
              Across
            </h3>
            <ul>
              {sortedAcrossWords.map((word) => {
                const isActive = activeWordIds.acrossId === word.id && activeWordIds.activeType === "across";
                const firstCell = word.cells[0];
                const isComplete = word.cells.every(c => userInputs[`${c.row},${c.col}`]);
                const textColor = isComplete ? "var(--stone-400, #a8a29e)" : "var(--stone-800, #292524)";
                return (
                  <li 
                    key={word.id}
                    className={isActive ? "bg-mustard-100 rounded" : ""}
                    style={{
                      display: "flex",
                      padding: "8px 6px",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                    }}
                    onClick={() => firstCell && handleSelectCell(firstCell.row, firstCell.col, "across")}
                  >
                    <span style={{
                      color: textColor,
                      textAlign: "left",
                      fontFeatureSettings: "'dlig' on, 'hlig' on",
                      fontFamily: '"EB Garamond", serif',
                      fontSize: 14,
                      fontStyle: "normal",
                      fontWeight: 700,
                      lineHeight: "normal",
                      letterSpacing: -0.28,
                      minWidth: 20,
                    }}>
                      {word.clueNumber}
                    </span>
                    <span style={{
                      color: textColor,
                      textAlign: "justify",
                      fontFamily: '"EB Garamond", serif',
                      fontSize: 16,
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "normal",
                      letterSpacing: -0.32,
                    }}>
                      {word.clue}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div 
            ref={downListRef}
            onScroll={handleDownScroll}
            className={`clue-list-container ${downScrolled ? "clue-list-scrolled" : ""}`}
            style={{ 
              maxWidth: 250,
              maxHeight: 707, // Match crossword grid height
              overflowY: "auto",
            }}
          >
            <h3 className="clue-list-header" style={{
              position: "sticky",
              top: 0,
              backgroundColor: "var(--paper, #EAE8E1)",
              color: "var(--stone-800, #292524)",
              fontFeatureSettings: "'dlig' on, 'hlig' on",
              fontFamily: '"EB Garamond", serif',
              fontSize: 20,
              fontStyle: "italic",
              fontWeight: 500,
              lineHeight: "normal",
              letterSpacing: -0.4,
              paddingBottom: 16,
              paddingLeft: 6,
              marginBottom: 0,
              zIndex: 1,
            }}>
              Down
            </h3>
            <ul>
              {sortedDownWords.map((word) => {
                const isActive = activeWordIds.downId === word.id && activeWordIds.activeType === "down";
                const firstCell = word.cells[0];
                const isComplete = word.cells.every(c => userInputs[`${c.row},${c.col}`]);
                const textColor = isComplete ? "var(--stone-400, #a8a29e)" : "var(--stone-800, #292524)";
                return (
                  <li 
                    key={word.id}
                    className={isActive ? "bg-mustard-100 rounded" : ""}
                    style={{
                      display: "flex",
                      padding: "8px 6px",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                    }}
                    onClick={() => firstCell && handleSelectCell(firstCell.row, firstCell.col, "down")}
                  >
                    <span style={{
                      color: textColor,
                      textAlign: "left",
                      fontFeatureSettings: "'dlig' on, 'hlig' on",
                      fontFamily: '"EB Garamond", serif',
                      fontSize: 14,
                      fontStyle: "normal",
                      fontWeight: 700,
                      lineHeight: "normal",
                      letterSpacing: -0.28,
                      minWidth: 20,
                    }}>
                      {word.clueNumber}
                    </span>
                    <span style={{
                      color: textColor,
                      textAlign: "justify",
                      fontFamily: '"EB Garamond", serif',
                      fontSize: 16,
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "normal",
                      letterSpacing: -0.32,
                    }}>
                      {word.clue}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
