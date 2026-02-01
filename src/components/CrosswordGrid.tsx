"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { getCrosswordData, getActiveWordCells } from "@/lib/crossword-data";
import { getNextCell, getFirstCell } from "@/lib/crossword-navigation";
import { CrosswordCell } from "./CrosswordCell";

const crosswordData = getCrosswordData();

export function CrosswordGrid() {
  const data = useMemo(() => crosswordData, []);
  const firstCell = getFirstCell(data);

  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(() => firstCell);

  const handleCellSelect = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !gridRef.current) return;
      if (!gridRef.current.contains(document.activeElement)) return;

      const direction =
        e.key === "ArrowUp"
          ? "up"
          : e.key === "ArrowDown"
            ? "down"
            : e.key === "ArrowLeft"
              ? "left"
              : e.key === "ArrowRight"
                ? "right"
                : null;

      if (!direction) return;
      e.preventDefault();

      const next = getNextCell(
        data,
        selectedCell.row,
        selectedCell.col,
        direction
      );
      if (next) {
        setSelectedCell(next);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, selectedCell]);

  const activeWordCells = selectedCell
    ? (() => {
        const across = getActiveWordCells(
          data,
          selectedCell.row,
          selectedCell.col,
          "across"
        );
        if (across.size > 0) return across;
        return getActiveWordCells(
          data,
          selectedCell.row,
          selectedCell.col,
          "down"
        );
      })()
    : new Set<string>();

  const gridRef = useRef<HTMLDivElement>(null);

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
