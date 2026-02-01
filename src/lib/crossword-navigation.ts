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

/**
 * Get the next word in the same direction that contains the same row/column.
 * For "across": jumps to next across word that contains the same column.
 * For "down": jumps to next down word that contains the same row.
 * 
 * @param reverse - If true, go to previous word instead of next (Shift+Tab)
 */
export function getNextWordCell(
  data: CrosswordData,
  currentRow: number,
  currentCol: number,
  wordDirection: WordDirection,
  reverse: boolean = false
): { row: number; col: number } | null {
  const cell = getCellAt(data, currentRow, currentCol);
  if (!cell || cell.type === "black") return null;

  const words = wordDirection === "across" ? data.acrossWords : data.downWords;
  const currentWordId = wordDirection === "across" ? cell.acrossWordId : cell.downWordId;
  
  if (currentWordId === undefined || words.length === 0) return null;

  // Filter words to only those that contain the target row/column
  const eligibleWords = words.filter(word => {
    if (wordDirection === "across") {
      // For across: word must contain the current column
      return word.cells.some(c => c.col === currentCol);
    } else {
      // For down: word must contain the current row
      return word.cells.some(c => c.row === currentRow);
    }
  });

  if (eligibleWords.length === 0) return null;

  // Sort eligible words by their position
  // For across: sort by row (top to bottom for words crossing this column)
  // For down: sort by column (left to right for words crossing this row)
  const sortedWords = [...eligibleWords].sort((a, b) => {
    if (wordDirection === "across") {
      // Sort by the row of the cell at the target column
      const aCell = a.cells.find(c => c.col === currentCol);
      const bCell = b.cells.find(c => c.col === currentCol);
      return (aCell?.row ?? 0) - (bCell?.row ?? 0);
    } else {
      // Sort by the column of the cell at the target row
      const aCell = a.cells.find(c => c.row === currentRow);
      const bCell = b.cells.find(c => c.row === currentRow);
      return (aCell?.col ?? 0) - (bCell?.col ?? 0);
    }
  });

  // Find current word index in sorted list
  const currentIndex = sortedWords.findIndex(w => w.id === currentWordId);
  if (currentIndex === -1) {
    // Current word doesn't cross this row/col, just return first eligible word
    const firstWord = sortedWords[0];
    if (wordDirection === "across") {
      const targetCell = firstWord.cells.find(c => c.col === currentCol);
      return targetCell ? { row: targetCell.row, col: targetCell.col } : null;
    } else {
      const targetCell = firstWord.cells.find(c => c.row === currentRow);
      return targetCell ? { row: targetCell.row, col: targetCell.col } : null;
    }
  }

  // Get next/previous word (with wrapping)
  let nextIndex: number;
  if (reverse) {
    nextIndex = currentIndex === 0 ? sortedWords.length - 1 : currentIndex - 1;
  } else {
    nextIndex = (currentIndex + 1) % sortedWords.length;
  }
  
  const nextWord = sortedWords[nextIndex];
  if (!nextWord || nextWord.cells.length === 0) return null;

  // Get the cell at the preserved row/column
  if (wordDirection === "across") {
    const targetCell = nextWord.cells.find(c => c.col === currentCol);
    return targetCell ? { row: targetCell.row, col: targetCell.col } : null;
  } else {
    const targetCell = nextWord.cells.find(c => c.row === currentRow);
    return targetCell ? { row: targetCell.row, col: targetCell.col } : null;
  }
}
