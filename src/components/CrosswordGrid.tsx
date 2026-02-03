"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CrosswordData, getActiveWordCells } from "@/lib/crossword-data";
import { getNextCell, getNextCellInWord, getNextWordCell, getWordDirection, getFirstEmptyCellInNextWord } from "@/lib/crossword-navigation";
import { CrosswordCell } from "./CrosswordCell";

interface CrosswordGridProps {
  data: CrosswordData;
  selectedCell: { row: number; col: number } | null;
  direction: "across" | "down";
  showAnswers: boolean;
  userInputs: Record<string, string>;
  onSelectCell: (row: number, col: number, direction: "across" | "down") => void;
  onInputLetter: (row: number, col: number, letter: string) => void;
  onClearCell: (row: number, col: number) => void;
  onMobileKeyboardOpen?: () => void;
  onMobileKeyboardClose?: () => void;
}

export function CrosswordGrid({ 
  data, 
  selectedCell, 
  direction, 
  showAnswers, 
  userInputs,
  onSelectCell,
  onInputLetter,
  onClearCell,
  onMobileKeyboardOpen,
  onMobileKeyboardClose,
}: CrosswordGridProps) {
  // Click handler with toggle behavior for already-selected cell
  const handleCellSelect = useCallback((row: number, col: number) => {
    const isAlreadySelected = selectedCell?.row === row && selectedCell?.col === col;
    
    if (isAlreadySelected) {
      // Toggle direction if cell belongs to both word types
      const cell = data.cells[row]?.[col];
      if (cell) {
        const hasAcross = cell.acrossWordId !== undefined;
        const hasDown = cell.downWordId !== undefined;
        
        if (hasAcross && hasDown) {
          const newDirection = direction === "across" ? "down" : "across";
          onSelectCell(row, col, newDirection);
          return;
        }
      }
      // Cell only has one word type - keep current direction
      onSelectCell(row, col, direction);
    } else {
      // New cell selected - use current direction if available, otherwise switch
      const cell = data.cells[row]?.[col];
      if (cell) {
        const hasAcross = cell.acrossWordId !== undefined;
        const hasDown = cell.downWordId !== undefined;
        
        // If current direction is available, use it
        if ((direction === "across" && hasAcross) || (direction === "down" && hasDown)) {
          onSelectCell(row, col, direction);
          return;
        }
        
        // Otherwise, switch to the available direction
        if (hasAcross) {
          onSelectCell(row, col, "across");
          return;
        }
        if (hasDown) {
          onSelectCell(row, col, "down");
          return;
        }
      }
      // Fallback
      onSelectCell(row, col, direction);
    }
  }, [selectedCell, direction, data, onSelectCell]);

  const gridRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/touch device for keyboard handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.matchMedia("(max-width: 768px)").matches ||
        window.matchMedia("(pointer: coarse)").matches
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Focus hidden input when cell selected on mobile (shows keyboard)
  useEffect(() => {
    if (isMobile && selectedCell && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobile, selectedCell]);

  // Scroll grid into view when keyboard opens on mobile (once per cell selection)
  const lastScrolledCellRef = useRef<string | null>(null);
  const handleMobileInputFocus = useCallback(() => {
    onMobileKeyboardOpen?.();
    if (!isMobile || !selectedCell || !gridRef.current) return;
    const cellKey = `${selectedCell.row},${selectedCell.col}`;
    if (lastScrolledCellRef.current === cellKey) return;
    lastScrolledCellRef.current = cellKey;
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
    }, 350);
  }, [isMobile, selectedCell, onMobileKeyboardOpen]);

  const handleMobileInputBlur = useCallback(() => {
    onMobileKeyboardClose?.();
  }, [onMobileKeyboardClose]);

  // Blur hidden input when clicking outside grid (hides keyboard on mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (!gridRef.current || !mobileInputRef.current) return;
      const target = e.target as Node;
      if (!gridRef.current.contains(target)) {
        mobileInputRef.current.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Handle input from mobile keyboard (hidden input)
  const handleMobileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedCell) return;
      const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
      if (value.length > 0) {
        const letter = value[0]; // First character (handles single key and paste)
        onInputLetter(selectedCell.row, selectedCell.col, letter);
        const next = getNextCellInWord(data, selectedCell.row, selectedCell.col, direction);
        if (next) {
          onSelectCell(next.row, next.col, direction);
        } else {
          const updatedInputs = {
            ...userInputs,
            [`${selectedCell.row},${selectedCell.col}`]: letter,
          };
          const nextWordCell = getFirstEmptyCellInNextWord(
            data,
            selectedCell.row,
            selectedCell.col,
            direction,
            updatedInputs
          );
          if (nextWordCell) {
            onSelectCell(nextWordCell.row, nextWordCell.col, direction);
          }
        }
      }
      e.target.value = "";
    },
    [selectedCell, data, direction, userInputs, onInputLetter, onSelectCell]
  );

  const handleMobileKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!selectedCell) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        onClearCell(selectedCell.row, selectedCell.col);
        const prev = getNextCellInWord(data, selectedCell.row, selectedCell.col, direction, true);
        if (prev) {
          onSelectCell(prev.row, prev.col, direction);
        }
      }
    },
    [selectedCell, data, direction, onClearCell, onSelectCell]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !gridRef.current) return;
      if (!gridRef.current.contains(document.activeElement)) return;
      // On mobile, the hidden input handles keyboard - skip to avoid double handling
      if (isMobile && document.activeElement === mobileInputRef.current) return;

      // Handle Tab key for jumping to next/previous word
      if (e.key === "Tab") {
        e.preventDefault();
        const result = getNextWordCell(
          data,
          selectedCell.row,
          selectedCell.col,
          direction,
          e.shiftKey // reverse if Shift+Tab
        );
        if (result) {
          onSelectCell(result.row, result.col, result.newDirection);
        }
        return;
      }
      
      // Handle Backspace to clear current cell and move back within word
      if (e.key === "Backspace") {
        e.preventDefault();
        onClearCell(selectedCell.row, selectedCell.col);
        
        // Move to previous cell within the same word
        const prev = getNextCellInWord(data, selectedCell.row, selectedCell.col, direction, true);
        if (prev) {
          onSelectCell(prev.row, prev.col, direction);
        } else {
          // At start of word - jump to last cell of previous word in same direction
          const prevWordResult = getNextWordCell(data, selectedCell.row, selectedCell.col, direction, true);
          if (prevWordResult) {
            // getNextWordCell returns the first cell, but we want the last cell
            const prevWords = prevWordResult.newDirection === "across" ? data.acrossWords : data.downWords;
            const prevWord = prevWords.find(w => 
              w.cells.some(c => c.row === prevWordResult.row && c.col === prevWordResult.col)
            );
            if (prevWord && prevWord.cells.length > 0) {
              const lastCell = prevWord.cells[prevWord.cells.length - 1];
              onSelectCell(lastCell.row, lastCell.col, prevWordResult.newDirection);
            }
          }
        }
        return;
      }
      
      // Handle letter input (A-Z)
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onInputLetter(selectedCell.row, selectedCell.col, e.key);
        
        // Move to next cell within the same word
        const next = getNextCellInWord(data, selectedCell.row, selectedCell.col, direction);
        if (next) {
          onSelectCell(next.row, next.col, direction);
        } else {
          // At end of word - jump to first empty cell of next word in same direction
          // We need to account for the letter we just typed by including it in userInputs
          const updatedInputs = {
            ...userInputs,
            [`${selectedCell.row},${selectedCell.col}`]: e.key.toUpperCase(),
          };
          const nextWordCell = getFirstEmptyCellInNextWord(
            data,
            selectedCell.row,
            selectedCell.col,
            direction,
            updatedInputs
          );
          if (nextWordCell) {
            onSelectCell(nextWordCell.row, nextWordCell.col, direction);
          }
        }
        return;
      }

      const arrowDirection =
        e.key === "ArrowUp"
          ? "up"
          : e.key === "ArrowDown"
            ? "down"
            : e.key === "ArrowLeft"
              ? "left"
              : e.key === "ArrowRight"
                ? "right"
                : null;

      if (!arrowDirection) return;
      e.preventDefault();

      // Determine word direction based on arrow key
      const newWordDirection = getWordDirection(arrowDirection);
      
      // Check if direction is changing
      if (newWordDirection !== direction) {
        // Check if current cell has a word in the new direction
        const cell = data.cells[selectedCell.row]?.[selectedCell.col];
        const hasWordInNewDirection = newWordDirection === "across" 
          ? cell?.acrossWordId !== undefined 
          : cell?.downWordId !== undefined;
        
        if (hasWordInNewDirection) {
          // Just change direction, don't move
          onSelectCell(selectedCell.row, selectedCell.col, newWordDirection);
          return;
        }
      }

      // Same direction or no word in new direction - move to next cell
      const next = getNextCell(
        data,
        selectedCell.row,
        selectedCell.col,
        arrowDirection
      );
      if (next) {
        // Check if destination cell has a word in the desired direction
        const nextCell = data.cells[next.row]?.[next.col];
        const hasAcross = nextCell?.acrossWordId !== undefined;
        const hasDown = nextCell?.downWordId !== undefined;
        
        let effectiveDirection = newWordDirection;
        if (newWordDirection === "across" && !hasAcross && hasDown) {
          effectiveDirection = "down";
        } else if (newWordDirection === "down" && !hasDown && hasAcross) {
          effectiveDirection = "across";
        }
        
        onSelectCell(next.row, next.col, effectiveDirection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, selectedCell, direction, userInputs, onSelectCell, onInputLetter, onClearCell, isMobile]);

  const activeWordCells = useMemo(() => {
    if (!selectedCell) return new Set<string>();
    
    // Use the tracked direction to determine which word to highlight
    const cells = getActiveWordCells(
      data,
      selectedCell.row,
      selectedCell.col,
      direction
    );
    
    // If no word exists in the current direction, fall back to the other direction
    if (cells.size === 0) {
      const fallbackDirection = direction === "across" ? "down" : "across";
      return getActiveWordCells(
        data,
        selectedCell.row,
        selectedCell.col,
        fallbackDirection
      );
    }
    
    return cells;
  }, [data, selectedCell, direction]);

  return (
    <div
      ref={gridRef}
      tabIndex={0}
      className="inline-flex flex-col p-0 outline-none relative"
      style={{ 
        border: "2px solid #292524",
        backgroundColor: "#57534e",
        gap: "1px"
      }}
      role="grid"
      aria-label="Crossword grid. Use arrow keys to navigate."
    >
      {/* Hidden input for mobile keyboard - only focused when cell selected */}
      <input
        ref={mobileInputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        aria-hidden
        tabIndex={-1}
        onChange={handleMobileInput}
        onKeyDown={handleMobileKeyDown}
        onFocus={handleMobileInputFocus}
        onBlur={handleMobileInputBlur}
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      {data.cells.map((rowCells, rowIndex) => (
        <div key={rowIndex} className="flex" style={{ gap: "1px" }}>
          {rowCells.map((cell) => (
            <CrosswordCell
              key={`${cell.row}-${cell.col}`}
              row={cell.row}
              col={cell.col}
              cellType={cell.type}
              letter={cell.letter}
              userInput={userInputs[`${cell.row},${cell.col}`]}
              number={cell.number}
              isSelected={
                selectedCell?.row === cell.row &&
                selectedCell?.col === cell.col
              }
              isInActiveWord={
                cell.type === "letter" &&
                activeWordCells.has(`${cell.row},${cell.col}`) &&
                !(
                  selectedCell?.row === cell.row &&
                  selectedCell?.col === cell.col
                )
              }
              showAnswers={showAnswers}
              onSelect={handleCellSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
