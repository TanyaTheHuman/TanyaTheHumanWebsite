"use client";

import type { CellType } from "@/lib/crossword-data";

interface CrosswordCellProps {
  row: number;
  col: number;
  cellType: CellType;
  letter?: string;
  isSelected: boolean;
  isInActiveWord: boolean;
  onSelect: (row: number, col: number) => void;
}

export function CrosswordCell({
  row,
  col,
  cellType,
  letter,
  isSelected,
  isInActiveWord,
  onSelect,
}: CrosswordCellProps) {
  if (cellType === "black") {
    return (
      <div
        className="h-8 w-8 shrink-0 bg-ink"
        style={{ width: 32, height: 32 }}
        aria-hidden
      />
    );
  }

  const bgClass = isSelected
    ? "bg-mustard-300"
    : isInActiveWord
      ? "bg-mustard-100"
      : "bg-cream";

  return (
    <button
      type="button"
      onClick={() => onSelect(row, col)}
      className={`h-8 w-8 shrink-0 border border-border cursor-pointer flex items-center justify-center font-serif text-sm font-medium uppercase ${bgClass} focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:ring-offset-1`}
      style={{ width: 32, height: 32 }}
      tabIndex={-1}
      aria-label={`Cell ${row + 1}, ${col + 1}${letter ? `, ${letter}` : ""}`}
    >
      {letter}
    </button>
  );
}
