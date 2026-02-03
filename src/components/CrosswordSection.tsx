"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { CrosswordGrid } from "./CrosswordGrid";
import { getCrosswordData, getWordContaining } from "@/lib/crossword-data";
import { getFirstCell } from "@/lib/crossword-navigation";

/* =============================================================================
   GRAIN PREVIEW CONTROLS (disabled)
   =============================================================================
   To re-enable the grain preview and sliders for testing:
   1. Uncomment the state variables and preview JSX below
   2. The preview block will appear above the crossword grid
   ============================================================================= */

export function CrosswordInteractive() {
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
  
  // Find the crossing word at the currently selected cell (only one)
  const crossingWordIds = useMemo(() => {
    const crossingAcross = new Set<number>();
    const crossingDown = new Set<number>();
    
    if (!selection) return { crossingAcross, crossingDown };
    
    // Get the cell at the current selection
    const gridCell = data.cells[selection.row]?.[selection.col];
    if (!gridCell) return { crossingAcross, crossingDown };
    
    // Find the crossing word at this specific cell (opposite direction)
    if (selection.direction === "across" && gridCell.downWordId !== undefined) {
      crossingDown.add(gridCell.downWordId);
    } else if (selection.direction === "down" && gridCell.acrossWordId !== undefined) {
      crossingAcross.add(gridCell.acrossWordId);
    }
    
    return { crossingAcross, crossingDown };
  }, [data, selection]);
  
  // Refs for clue list items to enable scrolling
  const acrossClueRefs = useRef<Map<number, HTMLLIElement>>(new Map());
  const downClueRefs = useRef<Map<number, HTMLLIElement>>(new Map());
  
  // Get the currently selected word for the highlighted clue display
  const selectedWord = useMemo(() => {
    if (!selection) return null;
    return getWordContaining(data, selection.row, selection.col, selection.direction);
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
  
  // Scroll crossing clues into view when selection changes, accounting for gradient
  useEffect(() => {
    const GRADIENT_HEIGHT = 48; // Height of the gradient fade at bottom

    // Scroll crossing across clues into view
    crossingWordIds.crossingAcross.forEach(wordId => {
      const element = acrossClueRefs.current.get(wordId);
      if (element && acrossListRef.current) {
        const container = acrossListRef.current;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        
        // Check if element is out of view (accounting for gradient)
        const visibleBottom = containerBottom - GRADIENT_HEIGHT;
        const isOutOfView = elementTop < containerTop || elementBottom > visibleBottom;
        
        if (isOutOfView) {
          // Calculate scroll position to show clue above gradient
          const scrollPosition = elementTop + element.offsetHeight - container.clientHeight + GRADIENT_HEIGHT;
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth"
          });
        }
      }
    });
    
    // Scroll crossing down clues into view
    crossingWordIds.crossingDown.forEach(wordId => {
      const element = downClueRefs.current.get(wordId);
      if (element && downListRef.current) {
        const container = downListRef.current;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        
        // Check if element is out of view (accounting for gradient)
        const visibleBottom = containerBottom - GRADIENT_HEIGHT;
        const isOutOfView = elementTop < containerTop || elementBottom > visibleBottom;
        
        if (isOutOfView) {
          // Calculate scroll position to show clue above gradient
          const scrollPosition = elementTop + element.offsetHeight - container.clientHeight + GRADIENT_HEIGHT;
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth"
          });
        }
      }
    });
  }, [crossingWordIds]);

  // Scroll selected clue into view when it's out of view, accounting for gradient
  useEffect(() => {
    if (!selectedWord) return;

    const isAcross = activeWordIds.activeType === "across" && activeWordIds.acrossId === selectedWord.id;
    const isDown = activeWordIds.activeType === "down" && activeWordIds.downId === selectedWord.id;
    const GRADIENT_HEIGHT = 48; // Height of the gradient fade at bottom

    // Handle across clues
    if (isAcross && acrossListRef.current) {
      const element = acrossClueRefs.current.get(selectedWord.id);
      if (element) {
        const container = acrossListRef.current;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        
        // Check if element is out of view (accounting for gradient)
        const visibleBottom = containerBottom - GRADIENT_HEIGHT;
        const isOutOfView = elementTop < containerTop || elementBottom > visibleBottom;
        
        if (isOutOfView) {
          // Calculate scroll position to show clue above gradient
          // Position element so its bottom is above the gradient area
          const scrollPosition = elementTop + element.offsetHeight - container.clientHeight + GRADIENT_HEIGHT;
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth"
          });
        }
      }
    }

    // Handle down clues
    if (isDown && downListRef.current) {
      const element = downClueRefs.current.get(selectedWord.id);
      if (element) {
        const container = downListRef.current;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        
        // Check if element is out of view (accounting for gradient)
        const visibleBottom = containerBottom - GRADIENT_HEIGHT;
        const isOutOfView = elementTop < containerTop || elementBottom > visibleBottom;
        
        if (isOutOfView) {
          // Calculate scroll position to show clue above gradient
          // Position element so its bottom is above the gradient area
          const scrollPosition = elementTop + element.offsetHeight - container.clientHeight + GRADIENT_HEIGHT;
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth"
          });
        }
      }
    }
  }, [selectedWord, sortedAcrossWords, sortedDownWords, activeWordIds]);
  
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
        
        {/* Highlighted clue view above the grid */}
        {selectedWord && (
          <div 
            className="bg-mustard-100 rounded"
            style={{
              display: "flex",
              padding: "12px 16px",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 16,
              width: "100%",
            }}
          >
            <span style={{
              color: "var(--stone-800, #292524)",
              textAlign: "right",
              fontFamily: '"EB Garamond", serif',
              fontSize: 26,
              fontStyle: "normal",
              fontWeight: 700,
              lineHeight: "normal",
              letterSpacing: -0.52,
              minWidth: 32,
            }}>
              {selectedWord.clueNumber}
            </span>
            <span style={{
              color: "var(--stone-800, #292524)",
              textAlign: "left",
              fontFeatureSettings: "'dlig' on, 'hlig' on",
              fontFamily: '"EB Garamond", serif',
              fontSize: 20,
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
              letterSpacing: -0.4,
              marginTop: 4,
              width: "100%",
            }}>
              {selectedWord.clue}
            </span>
          </div>
        )}
        
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

        <div className="clue-lists flex flex-col lg:flex-row" style={{ 
          gap: 24,
          borderBottom: "1px solid var(--stone-800, #292524)",
        }}>
          <div 
            ref={acrossListRef}
            onScroll={handleAcrossScroll}
            className={`across-clue-list clue-list-container ${acrossScrolled ? "clue-list-scrolled" : ""}`}
            style={{ 
              maxWidth: 250,
              maxHeight: 783, // Match crossword grid (707px) + highlighted clue (~60px) + margin (16px)
              overflowY: "auto",
            }}
          >
            <h3 className="clue-list-header" style={{
              position: "sticky",
              top: 0,
              backgroundColor: "var(--paper, #EAE8E1)",
              color: "var(--stone-800, #292524)",
              fontFeatureSettings: "'dlig' on, 'hlig' on, 'fina' on, 'kern' on, 'rlig' on, 'swsh' on, 'cswh' on",
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
                const isCrossing = crossingWordIds.crossingAcross.has(word.id);
                const firstCell = word.cells[0];
                const isComplete = word.cells.every(c => userInputs[`${c.row},${c.col}`]);
                const textColor = isComplete ? "var(--stone-400, #a8a29e)" : "var(--stone-800, #292524)";
                return (
                  <li 
                    key={word.id}
                    ref={(el) => {
                      if (el) acrossClueRefs.current.set(word.id, el);
                      else acrossClueRefs.current.delete(word.id);
                    }}
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
                    <span 
                      className={isCrossing && !isActive ? "bg-mustard-100 rounded" : ""}
                      style={{
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
                        paddingLeft: 2,
                      }}
                    >
                      {word.clueNumber}
                    </span>
                    <span style={{
                      color: textColor,
                      textAlign: "left",
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
              maxHeight: 783, // Match crossword grid (707px) + highlighted clue (~60px) + margin (16px)
              overflowY: "auto",
            }}
          >
            <h3 className="clue-list-header" style={{
              position: "sticky",
              top: 0,
              backgroundColor: "var(--paper, #EAE8E1)",
              color: "var(--stone-800, #292524)",
              fontFeatureSettings: "'dlig' on, 'hlig' on, 'fina' on, 'kern' on, 'rlig' on, 'swsh' on, 'cswh' on",
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
                const isCrossing = crossingWordIds.crossingDown.has(word.id);
                const firstCell = word.cells[0];
                const isComplete = word.cells.every(c => userInputs[`${c.row},${c.col}`]);
                const textColor = isComplete ? "var(--stone-400, #a8a29e)" : "var(--stone-800, #292524)";
                return (
                  <li 
                    key={word.id}
                    ref={(el) => {
                      if (el) downClueRefs.current.set(word.id, el);
                      else downClueRefs.current.delete(word.id);
                    }}
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
                    <span 
                      className={isCrossing && !isActive ? "bg-mustard-100 rounded" : ""}
                      style={{
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
                        paddingLeft: 2,
                      }}
                    >
                      {word.clueNumber}
                    </span>
                    <span style={{
                      color: textColor,
                      textAlign: "left",
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
