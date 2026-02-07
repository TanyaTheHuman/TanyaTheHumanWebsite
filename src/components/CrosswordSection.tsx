"use client";

import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { CrosswordGrid } from "./CrosswordGrid";
import { getCrosswordData, getWordContaining } from "@/lib/crossword-data";
import { getFirstCell, getFirstEmptyCellInNextWord, getFirstEmptyCellInPreviousWord } from "@/lib/crossword-navigation";

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
  // Desktop: first cell selected on load. Mobile: cleared when we detect mobile.
  const [selection, setSelection] = useState<{
    row: number;
    col: number;
    direction: "across" | "down";
  } | null>(() => firstCell ? { ...firstCell, direction: "across" } : null);
  
  const [isMobile, setIsMobile] = useState(false);

  // Toggle for showing/hiding answers (dev only, default off)
  const [showAnswers, setShowAnswers] = useState(false);
  
  // User input state: maps "row,col" to the letter entered by user
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  
  // Scroll state for clue lists (to show border under sticky headers)
  const [acrossScrolled, setAcrossScrolled] = useState(false);
  const [downScrolled, setDownScrolled] = useState(false);
  const acrossListRef = useRef<HTMLDivElement>(null);
  const downListRef = useRef<HTMLDivElement>(null);
  const clueBarRef = useRef<HTMLDivElement>(null);
  
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

  // Detect mobile on mount; clear selection only on mobile (before paint to avoid flash)
  useLayoutEffect(() => {
    const mobile =
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsMobile(mobile);
    if (mobile) {
      setSelection(null);
    }
  }, []);

  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.matchMedia("(max-width: 768px)").matches ||
        window.matchMedia("(pointer: coarse)").matches
      );
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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

  // Mobile clue bar: prev/next cells for anchor hrefs
  const prevCell = useMemo(() => {
    if (!selection) return null;
    return getFirstEmptyCellInPreviousWord(
      data,
      selection.row,
      selection.col,
      selection.direction,
      userInputs
    );
  }, [selection, data, userInputs]);

  const nextCell = useMemo(() => {
    if (!selection) return null;
    return getFirstEmptyCellInNextWord(
      data,
      selection.row,
      selection.col,
      selection.direction,
      userInputs
    );
  }, [selection, data, userInputs]);

  const handlePrevWord = useCallback(() => {
    if (prevCell) {
      handleSelectCell(prevCell.row, prevCell.col, selection!.direction);
    }
  }, [prevCell, selection, handleSelectCell]);

  const handleNextWord = useCallback(() => {
    if (nextCell) {
      handleSelectCell(nextCell.row, nextCell.col, selection!.direction);
    }
  }, [nextCell, selection, handleSelectCell]);

  // Mobile clue bar: toggle direction (middle tap)
  const handleToggleDirection = useCallback(() => {
    if (!selection) return;
    const cell = data.cells[selection.row]?.[selection.col];
    if (!cell || cell.type === "black") return;
    const hasAcross = cell.acrossWordId !== undefined;
    const hasDown = cell.downWordId !== undefined;
    if (hasAcross && hasDown) {
      const newDirection = selection.direction === "across" ? "down" : "across";
      handleSelectCell(selection.row, selection.col, newDirection);
    }
  }, [selection, data, handleSelectCell]);
  
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

  const showLargeClue = !!selectedWord;

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

  const clueContent = showLargeClue && selectedWord ? (
    <>
      <span className="text-stone-800 text-right font-serif text-[26px] font-bold leading-normal tracking-[-0.52px] min-w-[32px]">
        {selectedWord.clueNumber}
      </span>
      <span className="text-stone-800 text-left font-serif text-[20px] font-normal leading-normal tracking-[-0.4px] mt-1 w-full [font-feature-settings:'dlig'_on,'hlig'_on]">
        {selectedWord.clue}
      </span>
    </>
  ) : null;

  return (
    <div className="group">
      <section
        className="w-full flex justify-center px-8 pt-[200px] pb-[200px]"
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="shrink-0">
        {/* GRAIN PREVIEW - UNCOMMENT TO ENABLE
        <div className="mb-4 p-4 bg-stone-100 rounded text-sm font-sans w-[300px]">
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
          <div className="w-[200px] h-[200px] relative border border-[#ccc]">
            <svg width="200" height="200" className="absolute inset-0">
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
        
        {/* Mobile: tap hint when no cell selected */}
        {/* Highlighted clue: above grid on desktop, fixed above keyboard on mobile (focus-within) */}
        {clueContent && (
          <div className="hidden md:flex bg-mustard-100 rounded items-start gap-4 py-3 px-4 mb-6 z-10 w-full">
            {clueContent}
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
          excludeFromBlurRef={clueBarRef}
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

        <div className="clue-lists hidden md:flex flex-col lg:flex-row gap-6 border-b border-stone-800 md:max-lg:h-[783px]">
          <div 
            ref={acrossListRef}
            onScroll={handleAcrossScroll}
            className="across-clue-list clue-list-container max-w-[250px] max-h-[783px] md:flex-1 md:min-h-0 md:max-h-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative md:border-b md:border-stone-800"
          >
            <h3 className={`sticky top-0 bg-cream text-stone-800 font-serif text-[20px] italic font-medium leading-normal tracking-[-0.4px] pb-4 pl-[6px] mb-0 z-[1] [font-feature-settings:'dlig'_on,'hlig'_on,'fina'_on,'kern'_on,'rlig'_on,'swsh'_on,'cswh'_on] transition-shadow duration-150 ${acrossScrolled ? "shadow-[0_1px_0_0_#292524]" : "shadow-[0_1px_0_0_transparent]"}`}>
              Across
            </h3>
            <ul>
              {sortedAcrossWords.map((word) => {
                const isActive = activeWordIds.acrossId === word.id && activeWordIds.activeType === "across";
                const isCrossing = crossingWordIds.crossingAcross.has(word.id);
                const firstCell = word.cells[0];
                const isComplete = word.cells.every(c => userInputs[`${c.row},${c.col}`]);
                const textColorClass = isComplete ? "text-stone-400" : "text-stone-800";
                return (
                  <li 
                    key={word.id}
                    ref={(el) => {
                      if (el) acrossClueRefs.current.set(word.id, el);
                      else acrossClueRefs.current.delete(word.id);
                    }}
                    className={`flex items-start gap-3 cursor-pointer py-2 px-[6px] ${isActive ? "bg-mustard-100 rounded" : ""}`}
                    onClick={() => firstCell && handleSelectCell(firstCell.row, firstCell.col, "across")}
                  >
                    <span 
                      className={`text-left font-serif text-[14px] font-bold leading-normal tracking-[-0.28px] min-w-[20px] pl-0.5 [font-feature-settings:'dlig'_on,'hlig'_on] ${textColorClass} ${isCrossing && !isActive ? "bg-mustard-100 rounded" : ""}`}
                    >
                      {word.clueNumber}
                    </span>
                    <span className={`text-left font-serif text-[16px] font-normal leading-normal tracking-[-0.32px] ${textColorClass}`}>
                      {word.clue}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream/90 to-transparent pointer-events-none" />
          </div>
          <div 
            ref={downListRef}
            onScroll={handleDownScroll}
            className="clue-list-container max-w-[250px] max-h-[783px] md:flex-1 md:min-h-0 md:max-h-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative"
          >
            <h3 className={`sticky top-0 bg-cream text-stone-800 font-serif text-[20px] italic font-medium leading-normal tracking-[-0.4px] pb-4 pl-[6px] mb-0 z-[1] [font-feature-settings:'dlig'_on,'hlig'_on,'fina'_on,'kern'_on,'rlig'_on,'swsh'_on,'cswh'_on] transition-shadow duration-150 ${downScrolled ? "shadow-[0_1px_0_0_#292524]" : "shadow-[0_1px_0_0_transparent]"}`}>
              Down
            </h3>
            <ul>
              {sortedDownWords.map((word) => {
                const isActive = activeWordIds.downId === word.id && activeWordIds.activeType === "down";
                const isCrossing = crossingWordIds.crossingDown.has(word.id);
                const firstCell = word.cells[0];
                const isComplete = word.cells.every(c => userInputs[`${c.row},${c.col}`]);
                const textColorClass = isComplete ? "text-stone-400" : "text-stone-800";
                return (
                  <li 
                    key={word.id}
                    ref={(el) => {
                      if (el) downClueRefs.current.set(word.id, el);
                      else downClueRefs.current.delete(word.id);
                    }}
                    className={`flex items-start gap-3 cursor-pointer py-2 px-[6px] ${isActive ? "bg-mustard-100 rounded" : ""}`}
                    onClick={() => firstCell && handleSelectCell(firstCell.row, firstCell.col, "down")}
                  >
                    <span 
                      className={`text-left font-serif text-[14px] font-bold leading-normal tracking-[-0.28px] min-w-[20px] pl-0.5 [font-feature-settings:'dlig'_on,'hlig'_on] ${textColorClass} ${isCrossing && !isActive ? "bg-mustard-100 rounded" : ""}`}
                    >
                      {word.clueNumber}
                    </span>
                    <span className={`text-left font-serif text-[16px] font-normal leading-normal tracking-[-0.32px] ${textColorClass}`}>
                      {word.clue}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream/90 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
      {/* Mobile clue: fixed overlay when input focused, docks above keyboard with nav chevrons */}
      {clueContent && (
        <div className="sm:hidden hidden group-focus-within:fixed group-focus-within:block h-dvh top-0 inset-x-0 pointer-events-none z-50">
          <div
            ref={clueBarRef}
            className="fixed bottom-0 left-0 right-0 flex items-center justify-between py-3 px-2 bg-mustard-100 w-full text-ink rounded-none pointer-events-auto touch-manipulation"
          >
            {prevCell ? (
              <a
                href={`#cell-${prevCell.row}-${prevCell.col}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevWord();
                  document.getElementById(`cell-${prevCell.row}-${prevCell.col}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="w-10 shrink-0 flex items-center justify-center cursor-pointer touch-manipulation p-0 border-0 bg-transparent no-underline text-inherit"
                aria-label="Previous word"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M15 18L9 12L15 6" stroke="#292524" strokeWidth="2" strokeLinecap="square" strokeLinejoin="bevel" />
                </svg>
              </a>
            ) : (
              <div
                role="button"
                tabIndex={-1}
                onClick={() => {}}
                className="w-10 shrink-0 flex items-center justify-center cursor-default touch-manipulation p-0 border-0 bg-transparent opacity-40"
                aria-label="Previous word"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M15 18L9 12L15 6" stroke="#292524" strokeWidth="2" strokeLinecap="square" strokeLinejoin="bevel" />
                </svg>
              </div>
            )}
            <div
              role="button"
              tabIndex={-1}
              onClick={handleToggleDirection}
              onKeyDown={(e) => e.key === "Enter" && handleToggleDirection()}
              className="flex-1 min-w-0 flex items-start gap-4 px-2 touch-manipulation"
            >
              {selectedWord && (
                <>
                  <span className="text-stone-800 text-right font-serif text-[20px] font-bold leading-normal tracking-[-0.4px] min-w-[28px] shrink-0">
                    {selectedWord.clueNumber}
                  </span>
                  <span className="text-stone-800 text-justify font-serif text-[18px] font-normal leading-normal tracking-[-0.32px] w-full [font-feature-settings:'dlig'_on,'hlig'_on]">
                    {selectedWord.clue}
                  </span>
                </>
              )}
            </div>
            {nextCell ? (
              <a
                href={`#cell-${nextCell.row}-${nextCell.col}`}
                onClick={(e) => {
                  handleNextWord();
                  e.preventDefault();
                  document.getElementById(`cell-${nextCell.row}-${nextCell.col}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="w-10 shrink-0 flex items-center justify-center cursor-pointer touch-manipulation p-0 border-0 bg-transparent no-underline text-inherit"
                aria-label="Next word"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M9 18L15 12L9 6" stroke="#292524" strokeWidth="2" strokeLinecap="square" strokeLinejoin="bevel" />
                </svg>
              </a>
            ) : (
              <div
                role="button"
                tabIndex={-1}
                onClick={() => {}}
                className="w-10 shrink-0 flex items-center justify-center cursor-default touch-manipulation p-0 border-0 bg-transparent opacity-40"
                aria-label="Next word"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M9 18L15 12L9 6" stroke="#292524" strokeWidth="2" strokeLinecap="square" strokeLinejoin="bevel" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
