"use client";

import type { CellType } from "@/lib/crossword-data";

interface CrosswordCellProps {
  row: number;
  col: number;
  cellType: CellType;
  letter?: string;
  number?: number;
  isSelected: boolean;
  isInActiveWord: boolean;
  onSelect: (row: number, col: number) => void;
}

export function CrosswordCell({
  row,
  col,
  cellType,
  letter,
  number,
  isSelected,
  isInActiveWord,
  onSelect,
}: CrosswordCellProps) {
  if (cellType === "black") {
    return (
      <div
        className="shrink-0"
        style={{ 
          width: 31, 
          height: 31,
          backgroundColor: "#1a1a1a",
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            rgba(87,83,78,0.25) 2px,
            rgba(87,83,78,0.25) 3px
          )`
        }}
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
      className={`shrink-0 cursor-pointer relative font-serif font-medium uppercase ${bgClass} focus:outline-none`}
      style={{ width: 31, height: 31 }}
      tabIndex={-1}
      aria-label={`Cell ${row + 1}, ${col + 1}${number ? `, clue ${number}` : ""}${letter ? `, ${letter}` : ""}`}
    >
      {number && (
        <span
          className="absolute font-serif text-stone-600"
          style={{ top: 1, left: 1, fontSize: 10, fontWeight: 600, lineHeight: 1 }}
        >
          {number}
        </span>
      )}
      <span style={{ fontSize: 14, lineHeight: "18px" }}>
        {letter}
      </span>
    </button>
  );
}
