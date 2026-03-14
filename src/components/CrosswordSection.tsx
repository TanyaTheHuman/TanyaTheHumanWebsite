"use client";

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { CrosswordGrid } from "./CrosswordGrid";
import {
  getCrosswordData,
  getWordContaining,
  getCrossReferencedCells,
  getWordByClueNumber,
  getFilledWordsMap,
} from "@/lib/crossword-data";
import { loadProgress, saveProgress } from "@/lib/crossword-storage";
import {
  getFirstCell,
  getFirstEmptyCellInNextWord,
  getFirstEmptyCellInPreviousWord,
} from "@/lib/crossword-navigation";

export interface CrosswordInteractiveHandle {
  scrollToWord(clueNumber: number, direction: "across" | "down"): void;
}

export interface CrosswordInteractiveProps {
  onFilledWordsChange?: (filledWords: Record<string, string>) => void;
}

/* =============================================================================
   GRAIN PREVIEW CONTROLS (disabled)
   =============================================================================
   To re-enable the grain preview and sliders for testing:
   1. Uncomment the state variables and preview JSX below
   2. The preview block will appear above the crossword grid
   ============================================================================= */

export const CrosswordInteractive = forwardRef<
  CrosswordInteractiveHandle,
  CrosswordInteractiveProps
>(function CrosswordInteractive({ onFilledWordsChange }, ref) {
  const data = useMemo(() => getCrosswordData(), []);
  const firstCell = useMemo(() => getFirstCell(data), [data]);

  // Selection state with direction tracking
  // Desktop: first cell selected on load. Mobile: cleared when we detect mobile.
  const [selection, setSelection] = useState<{
    row: number;
    col: number;
    direction: "across" | "down";
  } | null>(() => (firstCell ? { ...firstCell, direction: "across" } : null));

  const [isMobile, setIsMobile] = useState(false);

  // Toggle for showing/hiding answers (dev only, default off)
  const [showAnswers, setShowAnswers] = useState(false);

  // Clear grid confirmation modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Clear ticker-tape animation: run flip wave then clear data
  const [isClearingAnimation, setIsClearingAnimation] = useState(false);
  const CLEAR_STAGGER_MS = 50;
  const CLEAR_FLIP_DURATION_MS = 300;

  // User input state: maps "row,col" to the letter entered by user
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});

  // Scroll state for clue lists (to show border under sticky headers)
  const [acrossScrolled, setAcrossScrolled] = useState(false);
  const [downScrolled, setDownScrolled] = useState(false);
  const acrossListRef = useRef<HTMLDivElement>(null);
  const downListRef = useRef<HTMLDivElement>(null);
  const clueBarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridColumnRef = useRef<HTMLDivElement>(null);
  const crosswordRowRef = useRef<HTMLDivElement>(null);
  const [gridColumnHeight, setGridColumnHeight] = useState<number | null>(null);
  const saveEffectRunCount = useRef(0);
  const clearAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Clear animation timeout on unmount
  useEffect(() => {
    return () => {
      if (clearAnimationTimeoutRef.current)
        clearTimeout(clearAnimationTimeoutRef.current);
    };
  }, []);

  // Ensure a cell is always selected (e.g. after loading progress with no selection)
  useEffect(() => {
    if (selection == null) {
      const cell =
        firstCell ?? getWordByClueNumber(data, 6, "across")?.cells[0];
      if (cell)
        setSelection({ row: cell.row, col: cell.col, direction: "across" });
    }
  }, [data, firstCell, selection]);

  // Focus the selected cell when selection changes (so a cell is always in focus)
  useLayoutEffect(() => {
    if (!selection) return;
    const cellEl = document.getElementById(
      `cell-${selection.row}-${selection.col}`,
    );
    if (cellEl && typeof (cellEl as HTMLElement).focus === "function")
      (cellEl as HTMLElement).focus();
    else gridRef.current?.focus();
  }, [selection?.row, selection?.col]);

  // When focus leaves the crossword area, put it back on the selected cell
  useEffect(() => {
    const rowEl = crosswordRowRef.current;
    if (!rowEl) return;
    const handleFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next != null && rowEl.contains(next)) return;
      if (!selection) return;
      requestAnimationFrame(() => {
        const cellEl = document.getElementById(
          `cell-${selection.row}-${selection.col}`,
        );
        if (cellEl && typeof (cellEl as HTMLElement).focus === "function")
          (cellEl as HTMLElement).focus();
        else gridRef.current?.focus();
      });
    };
    rowEl.addEventListener("focusout", handleFocusOut, true);
    return () => rowEl.removeEventListener("focusout", handleFocusOut, true);
  }, [selection]);

  // Match right column (clue lists + buttons) height to grid column (highlight clue + grid)
  useLayoutEffect(() => {
    const el = gridColumnRef.current;
    if (!el) return;
    const updateHeight = () => setGridColumnHeight(el.offsetHeight);
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  // Load persisted progress from localStorage (client-only, after mount to avoid hydration mismatch)
  useEffect(() => {
    const progress = loadProgress(data);
    if (progress) {
      setUserInputs(progress.userInputs);
      const mobile =
        window.matchMedia("(max-width: 768px)").matches ||
        window.matchMedia("(pointer: coarse)").matches;
      const nextSelection =
        !mobile && progress.selection
          ? progress.selection
          : (() => {
              const c =
                firstCell ?? getWordByClueNumber(data, 6, "across")?.cells[0];
              return c
                ? { row: c.row, col: c.col, direction: "across" as const }
                : null;
            })();
      if (nextSelection) setSelection(nextSelection);
    }
  }, [data, firstCell]);

  // Persist progress to localStorage when userInputs or selection change (skip first run to avoid overwriting before load)
  useEffect(() => {
    saveEffectRunCount.current += 1;
    if (saveEffectRunCount.current <= 1) return;
    saveProgress({ userInputs, selection });
  }, [userInputs, selection]);

  const filledWordsMap = useMemo(
    () => getFilledWordsMap(data, userInputs),
    [data, userInputs],
  );

  useEffect(() => {
    onFilledWordsChange?.(filledWordsMap);
  }, [onFilledWordsChange, filledWordsMap]);

  // Detect mobile on mount (selection is kept so a cell is always in focus)
  useLayoutEffect(() => {
    const mobile =
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.matchMedia("(max-width: 768px)").matches ||
          window.matchMedia("(pointer: coarse)").matches,
      );
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleInputLetter = useCallback(
    (row: number, col: number, letter: string) => {
      setUserInputs((prev) => ({
        ...prev,
        [`${row},${col}`]: letter.toUpperCase(),
      }));
    },
    [],
  );

  const handleClearCell = useCallback((row: number, col: number) => {
    setUserInputs((prev) => {
      const next = { ...prev };
      delete next[`${row},${col}`];
      return next;
    });
  }, []);

  const handleRevealWord = useCallback(() => {
    if (!selection) return;
    const word = getWordContaining(
      data,
      selection.row,
      selection.col,
      selection.direction,
    );
    if (!word?.cells.length) return;
    setUserInputs((prev) => {
      const next = { ...prev };
      for (const c of word.cells) {
        const letter = data.cells[c.row]?.[c.col]?.letter;
        if (letter) next[`${c.row},${c.col}`] = letter.toUpperCase();
      }
      return next;
    });
  }, [data, selection]);

  const handleSelectCell = useCallback(
    (row: number, col: number, direction: "across" | "down") => {
      setSelection({ row, col, direction });
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToWord(clueNumber: number, direction: "across" | "down") {
        const word = getWordByClueNumber(data, clueNumber, direction);
        if (!word?.cells.length) return;
        const first = word.cells[0];
        setSelection({ row: first.row, col: first.col, direction });
        setTimeout(() => {
          const cellEl = document.getElementById(
            `cell-${first.row}-${first.col}`,
          ) as HTMLElement | null;
          if (cellEl) {
            cellEl.focus();
            cellEl.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            gridRef.current?.focus();
          }
        }, 0);
      },
    }),
    [data],
  );

  // Mobile clue bar: prev/next cells for anchor hrefs
  const prevCell = useMemo(() => {
    if (!selection) return null;
    return getFirstEmptyCellInPreviousWord(
      data,
      selection.row,
      selection.col,
      selection.direction,
      userInputs,
    );
  }, [selection, data, userInputs]);

  const nextCell = useMemo(() => {
    if (!selection) return null;
    return getFirstEmptyCellInNextWord(
      data,
      selection.row,
      selection.col,
      selection.direction,
      userInputs,
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
    if (!selection)
      return {
        acrossId: null as number | null,
        downId: null as number | null,
        activeType: "across" as const,
      };

    const cell = data.cells[selection.row]?.[selection.col];
    if (!cell || cell.type === "black")
      return { acrossId: null, downId: null, activeType: selection.direction };

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
    } else if (
      selection.direction === "down" &&
      gridCell.acrossWordId !== undefined
    ) {
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
    return getWordContaining(
      data,
      selection.row,
      selection.col,
      selection.direction,
    );
  }, [data, selection]);

  const crossReferencedCells = useMemo(
    () => getCrossReferencedCells(data, selectedWord),
    [data, selectedWord],
  );

  // Sort words by clue number for display
  const sortedAcrossWords = useMemo(
    () => [...data.acrossWords].sort((a, b) => a.clueNumber - b.clueNumber),
    [data.acrossWords],
  );
  const sortedDownWords = useMemo(
    () => [...data.downWords].sort((a, b) => a.clueNumber - b.clueNumber),
    [data.downWords],
  );

  const showLargeClue = !!selectedWord;

  // Scroll crossing clues into view when selection changes, accounting for gradient
  useEffect(() => {
    const GRADIENT_HEIGHT = 32; // Height of the gradient fade at bottom (matches h-8)

    // Scroll crossing across clues into view
    crossingWordIds.crossingAcross.forEach((wordId) => {
      const element = acrossClueRefs.current.get(wordId);
      if (element && acrossListRef.current) {
        const container = acrossListRef.current;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;

        // Check if element is out of view (accounting for gradient)
        const visibleBottom = containerBottom - GRADIENT_HEIGHT;
        const isOutOfView =
          elementTop < containerTop || elementBottom > visibleBottom;

        if (isOutOfView) {
          // Calculate scroll position to show clue above gradient
          const scrollPosition =
            elementTop +
            element.offsetHeight -
            container.clientHeight +
            GRADIENT_HEIGHT;
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth",
          });
        }
      }
    });

    // Scroll crossing down clues into view
    crossingWordIds.crossingDown.forEach((wordId) => {
      const element = downClueRefs.current.get(wordId);
      if (element && downListRef.current) {
        const container = downListRef.current;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;

        // Check if element is out of view (accounting for gradient)
        const visibleBottom = containerBottom - GRADIENT_HEIGHT;
        const isOutOfView =
          elementTop < containerTop || elementBottom > visibleBottom;

        if (isOutOfView) {
          // Calculate scroll position to show clue above gradient
          const scrollPosition =
            elementTop +
            element.offsetHeight -
            container.clientHeight +
            GRADIENT_HEIGHT;
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth",
          });
        }
      }
    });
  }, [crossingWordIds]);

  // Scroll selected clue into view when it's out of view, accounting for gradient
  useEffect(() => {
    if (!selectedWord) return;

    const isAcross =
      activeWordIds.activeType === "across" &&
      activeWordIds.acrossId === selectedWord.id;
    const isDown =
      activeWordIds.activeType === "down" &&
      activeWordIds.downId === selectedWord.id;
    const GRADIENT_HEIGHT = 32; // Height of the gradient fade at bottom (matches h-8)

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
        const isOutOfView =
          elementTop < containerTop || elementBottom > visibleBottom;

        if (isOutOfView) {
          // Calculate scroll position to show clue above gradient
          // Position element so its bottom is above the gradient area
          const scrollPosition =
            elementTop +
            element.offsetHeight -
            container.clientHeight +
            GRADIENT_HEIGHT;
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth",
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
        const isOutOfView =
          elementTop < containerTop || elementBottom > visibleBottom;

        if (isOutOfView) {
          // Calculate scroll position to show clue above gradient
          // Position element so its bottom is above the gradient area
          const scrollPosition =
            elementTop +
            element.offsetHeight -
            container.clientHeight +
            GRADIENT_HEIGHT;
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth",
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

  const clueContent =
    showLargeClue && selectedWord ? (
      <>
        <span className="min-w-[32px] text-right font-serif text-[26px] leading-normal font-bold tracking-[-0.52px] text-stone-800">
          {selectedWord.clueNumber}
        </span>
        <span className="mt-1 min-w-0 flex-1 text-left font-serif text-[20px] leading-normal font-normal tracking-[-0.4px] text-stone-800 [font-feature-settings:'dlig'_on,'hlig'_on]">
          {selectedWord.clue}
        </span>
      </>
    ) : null;

  return (
    <div className="group">
      <section className="flex w-full flex-col items-center px-6 pt-[120px] pb-[120px] sm:px-8">
        <div
          ref={crosswordRowRef}
          className="flex w-full max-w-[1200px] flex-col items-center gap-8 min-[850px]:flex-row min-[850px]:items-stretch"
          style={
            gridColumnHeight != null
              ? { height: gridColumnHeight, minHeight: 0 }
              : undefined
          }
        >
          <div
            ref={gridColumnRef}
            className="w-min shrink-0 min-[850px]:self-start"
          >
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
              <div className="bg-mustard-100 z-10 mb-6 hidden h-[88px] w-full items-center justify-center gap-4 rounded px-4 py-3 min-[850px]:flex">
                {clueContent}
              </div>
            )}

            <div className="relative inline-flex flex-col">
              <CrosswordGrid
                data={data}
                selectedCell={
                  selection ? { row: selection.row, col: selection.col } : null
                }
                direction={selection?.direction ?? "across"}
                showAnswers={showAnswers}
                userInputs={userInputs}
                crossReferencedCells={crossReferencedCells}
                onSelectCell={handleSelectCell}
                onInputLetter={handleInputLetter}
                onClearCell={handleClearCell}
                excludeFromBlurRef={clueBarRef}
                gridRef={gridRef}
                isClearingAnimation={isClearingAnimation}
                clearStaggerMs={CLEAR_STAGGER_MS}
                clearFlipDurationMs={CLEAR_FLIP_DURATION_MS}
              />
              {showClearConfirm && (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 p-6"
                  style={{
                    background: "rgba(234, 232, 225, 0.93)",
                    backdropFilter: "blur(2px)",
                  }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="clear-confirm-title"
                >
                  <p
                    id="clear-confirm-title"
                    className="h6 max-w-[320px] text-center leading-[1.2] tracking-[-0.96px] text-stone-800 [font-feature-settings:'dlig'_on,'hlig'_on]"
                    style={{ fontSize: "32px" }}
                  >
                    Are you sure you want to clear the grid
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="body-default-bold text-ink focus:ring-mustard-300 focus:ring-offset-cream flex cursor-pointer items-center gap-[6px] border border-stone-500 bg-transparent px-[12px] py-[6px] text-base font-bold tracking-[-0.16px] [font-feature-settings:'dlig'_on] hover:border-stone-400 hover:bg-stone-300 hover:text-stone-700 focus:ring-1 focus:ring-offset-2 focus:outline-none"
                    >
                      Uh, no
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowClearConfirm(false);
                        // Start animation after modal is gone so the grid is visible when flip runs
                        requestAnimationFrame(() => {
                          if (clearAnimationTimeoutRef.current)
                            clearTimeout(clearAnimationTimeoutRef.current);
                          setIsClearingAnimation(true);
                          const maxStaggerIndex =
                            data.rows - 1 + (data.cols - 1);
                          const totalMs =
                            maxStaggerIndex * CLEAR_STAGGER_MS +
                            CLEAR_FLIP_DURATION_MS;
                          clearAnimationTimeoutRef.current = window.setTimeout(
                            () => {
                              const word = getWordByClueNumber(
                                data,
                                6,
                                "across",
                              );
                              const first = word?.cells[0];
                              if (first)
                                setSelection({
                                  row: first.row,
                                  col: first.col,
                                  direction: "across",
                                });
                              setUserInputs({});
                              setIsClearingAnimation(false);
                              clearAnimationTimeoutRef.current = null;
                            },
                            totalMs,
                          );
                        });
                      }}
                      className="body-default-bold text-ink focus:ring-mustard-300 focus:ring-offset-cream flex cursor-pointer items-center gap-[6px] border border-stone-500 bg-transparent px-[12px] py-[6px] text-base font-bold tracking-[-0.16px] [font-feature-settings:'dlig'_on] hover:border-stone-400 hover:bg-stone-300 hover:text-stone-700 focus:ring-1 focus:ring-offset-2 focus:outline-none"
                    >
                      Yeah, do it
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden min-h-0 w-full flex-col gap-[24px] min-[850px]:flex min-[850px]:h-full">
            <div className="clue-lists flex h-full min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden border-b border-stone-800 lg:flex-row">
              <div
                ref={acrossListRef}
                onScroll={handleAcrossScroll}
                className="across-clue-list clue-list-container relative max-h-[783px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] min-[850px]:min-h-0 min-[850px]:flex-1 min-[850px]:max-lg:border-b min-[850px]:max-lg:border-stone-800 [&::-webkit-scrollbar]:hidden"
              >
                <h3
                  className={`bg-cream sticky top-0 z-[1] mb-0 pb-4 pl-[6px] font-serif text-[20px] leading-normal font-medium tracking-[-0.4px] text-stone-800 italic transition-shadow duration-150 [font-feature-settings:'dlig'_on,'hlig'_on,'fina'_on,'kern'_on,'rlig'_on,'swsh'_on,'cswh'_on] ${acrossScrolled ? "shadow-[0_1px_0_0_#292524]" : "shadow-[0_1px_0_0_transparent]"}`}
                >
                  Across
                </h3>
                <ul>
                  {sortedAcrossWords.map((word) => {
                    const isActive =
                      activeWordIds.acrossId === word.id &&
                      activeWordIds.activeType === "across";
                    const isCrossing = crossingWordIds.crossingAcross.has(
                      word.id,
                    );
                    const firstCell = word.cells[0];
                    const isComplete = word.cells.every(
                      (c) => userInputs[`${c.row},${c.col}`],
                    );
                    const textColorClass = isComplete
                      ? "text-stone-400"
                      : "text-stone-800";
                    return (
                      <li
                        key={word.id}
                        ref={(el) => {
                          if (el) acrossClueRefs.current.set(word.id, el);
                          else acrossClueRefs.current.delete(word.id);
                        }}
                        className={`flex cursor-pointer items-start gap-3 px-[6px] py-2 ${isActive ? "bg-mustard-100 rounded" : ""}`}
                        onClick={() => {
                          if (firstCell) {
                            handleSelectCell(
                              firstCell.row,
                              firstCell.col,
                              "across",
                            );
                            gridRef.current?.focus();
                            document
                              .getElementById(
                                `cell-${firstCell.row}-${firstCell.col}`,
                              )
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                          }
                        }}
                      >
                        <span
                          className={`min-w-[20px] pl-0.5 text-left font-serif text-[14px] leading-normal font-bold tracking-[-0.28px] [font-feature-settings:'dlig'_on,'hlig'_on] ${textColorClass} ${isCrossing && !isActive ? "bg-mustard-100 rounded" : ""}`}
                        >
                          {word.clueNumber}
                        </span>
                        <span
                          className={`text-left font-serif text-[16px] leading-normal font-normal tracking-[-0.32px] ${textColorClass}`}
                        >
                          {word.clue}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div
                  className="list-bottom-gradient pointer-events-none sticky right-0 bottom-0 left-0 h-8"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(234, 232, 225, 0.00) -109.3%, rgba(234, 232, 225, 0.90) 100%)",
                  }}
                />
              </div>
              <div
                ref={downListRef}
                onScroll={handleDownScroll}
                className="clue-list-container relative max-h-[783px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] min-[850px]:min-h-0 min-[850px]:flex-1 [&::-webkit-scrollbar]:hidden"
              >
                <h3
                  className={`bg-cream sticky top-0 z-[1] mb-0 pb-4 pl-[6px] font-serif text-[20px] leading-normal font-medium tracking-[-0.4px] text-stone-800 italic transition-shadow duration-150 [font-feature-settings:'dlig'_on,'hlig'_on,'fina'_on,'kern'_on,'rlig'_on,'swsh'_on,'cswh'_on] ${downScrolled ? "shadow-[0_1px_0_0_#292524]" : "shadow-[0_1px_0_0_transparent]"}`}
                >
                  Down
                </h3>
                <ul>
                  {sortedDownWords.map((word) => {
                    const isActive =
                      activeWordIds.downId === word.id &&
                      activeWordIds.activeType === "down";
                    const isCrossing = crossingWordIds.crossingDown.has(
                      word.id,
                    );
                    const firstCell = word.cells[0];
                    const isComplete = word.cells.every(
                      (c) => userInputs[`${c.row},${c.col}`],
                    );
                    const textColorClass = isComplete
                      ? "text-stone-400"
                      : "text-stone-800";
                    return (
                      <li
                        key={word.id}
                        ref={(el) => {
                          if (el) downClueRefs.current.set(word.id, el);
                          else downClueRefs.current.delete(word.id);
                        }}
                        className={`flex cursor-pointer items-start gap-3 px-[6px] py-2 ${isActive ? "bg-mustard-100 rounded" : ""}`}
                        onClick={() => {
                          if (firstCell) {
                            handleSelectCell(
                              firstCell.row,
                              firstCell.col,
                              "down",
                            );
                            gridRef.current?.focus();
                            document
                              .getElementById(
                                `cell-${firstCell.row}-${firstCell.col}`,
                              )
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                          }
                        }}
                      >
                        <span
                          className={`min-w-[20px] pl-0.5 text-left font-serif text-[14px] leading-normal font-bold tracking-[-0.28px] [font-feature-settings:'dlig'_on,'hlig'_on] ${textColorClass} ${isCrossing && !isActive ? "bg-mustard-100 rounded" : ""}`}
                        >
                          {word.clueNumber}
                        </span>
                        <span
                          className={`text-left font-serif text-[16px] leading-normal font-normal tracking-[-0.32px] ${textColorClass}`}
                        >
                          {word.clue}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div
                  className="list-bottom-gradient pointer-events-none sticky right-0 bottom-0 left-0 h-8"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(234, 232, 225, 0.00) -109.3%, rgba(234, 232, 225, 0.90) 100%)",
                  }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-start gap-[16px] pt-0">
              <button
                type="button"
                onClick={handleRevealWord}
                disabled={!selection}
                className="body-default-bold text-ink focus:ring-mustard-300 focus:ring-offset-cream flex cursor-pointer items-center gap-[6px] border border-stone-500 bg-transparent px-[12px] py-[6px] text-base font-bold tracking-[-0.16px] [font-feature-settings:'dlig'_on] hover:border-stone-400 hover:bg-stone-300 hover:text-stone-700 focus:ring-1 focus:ring-offset-2 focus:outline-none disabled:cursor-default disabled:border-[0.5px] disabled:border-stone-400 disabled:text-stone-500 disabled:hover:border-stone-400 disabled:hover:bg-transparent disabled:hover:text-stone-500"
              >
                Reveal word
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={Object.keys(userInputs).length === 0}
                className="body-default-bold text-ink focus:ring-mustard-300 focus:ring-offset-cream flex cursor-pointer items-center gap-[6px] border border-stone-500 bg-transparent px-[12px] py-[6px] text-base font-bold tracking-[-0.16px] [font-feature-settings:'dlig'_on] hover:border-stone-400 hover:bg-stone-300 hover:text-stone-700 focus:ring-1 focus:ring-offset-2 focus:outline-none disabled:cursor-default disabled:border-[0.5px] disabled:border-stone-400 disabled:text-stone-500 disabled:hover:border-stone-400 disabled:hover:bg-transparent disabled:hover:text-stone-500"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        {/* DEV ONLY: Show answers toggle and Fill grid - only visible in development mode */}
        {process.env.NODE_ENV === "development" && (
          <div className="flex w-full max-w-[1200px] flex-wrap items-center gap-4 pt-0">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer peer-checked:bg-mustard-400 h-5 w-9 rounded-full bg-stone-300 transition-colors" />
                <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-ink font-serif text-sm">
                Show answers (dev only)
              </span>
            </label>
            <button
              type="button"
              onClick={() => {
                const filled: Record<string, string> = {};
                data.cells.forEach((row) => {
                  row.forEach((cell) => {
                    if (cell.type === "letter" && cell.letter) {
                      filled[`${cell.row},${cell.col}`] = cell.letter;
                    }
                  });
                });
                setUserInputs(filled);
              }}
              className="text-ink rounded font-serif text-sm underline hover:text-stone-600 focus:ring-2 focus:ring-stone-400 focus:outline-none"
            >
              Fill grid (dev only)
            </button>
          </div>
        )}
      </section>
      {/* Mobile clue: fixed overlay when input focused, docks above keyboard with nav chevrons (only below 850px) */}
      {clueContent && (
        <div className="pointer-events-none inset-x-0 top-0 z-50 hidden h-dvh max-[849px]:group-focus-within:fixed max-[849px]:group-focus-within:block">
          <div
            ref={clueBarRef}
            className="bg-mustard-100 text-ink pointer-events-auto fixed right-0 bottom-0 left-0 flex w-full touch-manipulation items-center justify-between rounded-none px-2 py-3"
          >
            {prevCell ? (
              <a
                href={`#cell-${prevCell.row}-${prevCell.col}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevWord();
                  document
                    .getElementById(`cell-${prevCell.row}-${prevCell.col}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="flex w-10 shrink-0 cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-inherit no-underline"
                aria-label="Previous word"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#292524"
                    strokeWidth="2"
                    strokeLinecap="square"
                    strokeLinejoin="bevel"
                  />
                </svg>
              </a>
            ) : (
              <div
                role="button"
                tabIndex={-1}
                onClick={() => {}}
                className="flex w-10 shrink-0 cursor-default touch-manipulation items-center justify-center border-0 bg-transparent p-0 opacity-40"
                aria-label="Previous word"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#292524"
                    strokeWidth="2"
                    strokeLinecap="square"
                    strokeLinejoin="bevel"
                  />
                </svg>
              </div>
            )}
            <div
              role="button"
              tabIndex={-1}
              onClick={handleToggleDirection}
              onKeyDown={(e) => e.key === "Enter" && handleToggleDirection()}
              className="flex min-w-0 flex-1 touch-manipulation items-start gap-4 px-2"
            >
              {selectedWord && (
                <>
                  <span className="min-w-[28px] shrink-0 text-right font-serif text-[20px] leading-normal font-bold tracking-[-0.4px] text-stone-800">
                    {selectedWord.clueNumber}
                  </span>
                  <span className="w-full text-justify font-serif text-[18px] leading-normal font-normal tracking-[-0.32px] text-stone-800 [font-feature-settings:'dlig'_on,'hlig'_on]">
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
                  document
                    .getElementById(`cell-${nextCell.row}-${nextCell.col}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="flex w-10 shrink-0 cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-inherit no-underline"
                aria-label="Next word"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#292524"
                    strokeWidth="2"
                    strokeLinecap="square"
                    strokeLinejoin="bevel"
                  />
                </svg>
              </a>
            ) : (
              <div
                role="button"
                tabIndex={-1}
                onClick={() => {}}
                className="flex w-10 shrink-0 cursor-default touch-manipulation items-center justify-center border-0 bg-transparent p-0 opacity-40"
                aria-label="Next word"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#292524"
                    strokeWidth="2"
                    strokeLinecap="square"
                    strokeLinejoin="bevel"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
