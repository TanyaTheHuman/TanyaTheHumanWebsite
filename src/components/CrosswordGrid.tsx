"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { CrosswordData, getActiveWordCells } from "@/lib/crossword-data";
import { getNextCell, getNextWordCell, getWordDirection } from "@/lib/crossword-navigation";
import { CrosswordCell } from "./CrosswordCell";

interface CrosswordGridProps {
  data: CrosswordData;
  selectedCell: { row: number; col: number } | null;
  direction: "across" | "down";
  onSelectCell: (row: number, col: number, direction: "across" | "down") => void;
}

export function CrosswordGrid({ data, selectedCell, direction, onSelectCell }: CrosswordGridProps) {
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
      // New cell selected - keep current direction
      onSelectCell(row, col, direction);
    }
  }, [selectedCell, direction, data, onSelectCell]);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !gridRef.current) return;
      if (!gridRef.current.contains(document.activeElement)) return;

      // Handle Tab key for jumping to next/previous word
      if (e.key === "Tab") {
        e.preventDefault();
        const nextCell = getNextWordCell(
          data,
          selectedCell.row,
          selectedCell.col,
          direction,
          e.shiftKey // reverse if Shift+Tab
        );
        if (nextCell) {
          onSelectCell(nextCell.row, nextCell.col, direction);
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
        onSelectCell(next.row, next.col, newWordDirection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, selectedCell, direction, onSelectCell]);

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
      className="inline-flex flex-col p-0 outline-none"
      style={{ 
        border: "2px solid #292524",
        backgroundColor: "#57534e",
        gap: "1px"
      }}
      role="grid"
      aria-label="Crossword grid. Use arrow keys to navigate."
    >
      {data.cells.map((rowCells, rowIndex) => (
        <div key={rowIndex} className="flex" style={{ gap: "1px" }}>
          {rowCells.map((cell) => (
            <CrosswordCell
              key={`${cell.row}-${cell.col}`}
              row={cell.row}
              col={cell.col}
              cellType={cell.type}
              letter={cell.letter}
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
              onSelect={handleCellSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
