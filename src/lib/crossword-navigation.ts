/**
 * Keyboard navigation for the crossword grid.
 * Skips black blocks and wraps at edges.
 */

import type { CrosswordData } from "./crossword-data";
import { getCellAt } from "./crossword-data";

export type Direction = "up" | "down" | "left" | "right";
export type WordDirection = "across" | "down";

/**
 * Maps an arrow key direction to a word direction.
 * Left/Right arrows = across word, Up/Down arrows = down word.
 */
export function getWordDirection(arrowDirection: Direction): WordDirection {
  return arrowDirection === "left" || arrowDirection === "right" ? "across" : "down";
}

export function getNextCell(
  data: CrosswordData,
  currentRow: number,
  currentCol: number,
  direction: Direction
): { row: number; col: number } | null {
  const { rows, cols } = data;
  let nextRow = currentRow;
  let nextCol = currentCol;

  switch (direction) {
    case "up":
      nextRow = currentRow - 1;
      break;
    case "down":
      nextRow = currentRow + 1;
      break;
    case "left":
      nextCol = currentCol - 1;
      break;
    case "right":
      nextCol = currentCol + 1;
      break;
  }

  // Out of bounds - don't wrap, return null to indicate no move
  if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
    return null;
  }

  const nextCell = getCellAt(data, nextRow, nextCol);
  if (!nextCell) return null;

  // If it's a letter cell, we found our target
  if (nextCell.type === "letter") {
    return { row: nextRow, col: nextCol };
  }

  // It's a black cell - recurse to skip over it
  return getNextCell(data, nextRow, nextCol, direction);
}

export function getFirstCell(data: CrosswordData): {
  row: number;
  col: number;
} | null {
  const firstAcross = data.acrossWords[0];
  if (firstAcross?.cells.length) {
    const first = firstAcross.cells[0];
    return { row: first.row, col: first.col };
  }

  // Fallback: first letter cell in row-major order
  for (let r = 0; r < data.rows; r++) {
    for (let c = 0; c < data.cols; c++) {
      const cell = getCellAt(data, r, c);
      if (cell?.type === "letter") return { row: r, col: c };
    }
  }
  return null;
}
