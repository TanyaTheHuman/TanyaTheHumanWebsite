/**
 * Keyboard navigation for the crossword grid.
 * Skips black blocks and wraps at edges.
 */

import type { CrosswordData } from "./crossword-data";
import { getCellAt, getWordContaining } from "./crossword-data";

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
 * Get the next or previous cell within the same word.
 * Returns null if at the end/beginning of the word.
 * 
 * @param reverse - If true, get previous cell instead of next
 */
export function getNextCellInWord(
  data: CrosswordData,
  currentRow: number,
  currentCol: number,
  wordDirection: WordDirection,
  reverse: boolean = false
): { row: number; col: number } | null {
  const word = getWordContaining(data, currentRow, currentCol, wordDirection);
  if (!word) return null;

  // Find current cell index in the word
  const currentIndex = word.cells.findIndex(
    c => c.row === currentRow && c.col === currentCol
  );
  if (currentIndex === -1) return null;

  // Get next/previous cell in word
  const nextIndex = reverse ? currentIndex - 1 : currentIndex + 1;
  
  // Return null if we've reached the end/beginning of the word
  if (nextIndex < 0 || nextIndex >= word.cells.length) {
    return null;
  }

  const nextCell = word.cells[nextIndex];
  return { row: nextCell.row, col: nextCell.col };
}

/**
 * Find the first empty cell in the next word of the same direction.
 * Used when the user completes a word and needs to jump to the next one.
 * 
 * @param userInputs - Record of user inputs keyed by "row,col"
 * @returns The first empty cell in the next available word, or null if all words are filled
 */
export function getFirstEmptyCellInNextWord(
  data: CrosswordData,
  currentRow: number,
  currentCol: number,
  wordDirection: WordDirection,
  userInputs: Record<string, string>
): { row: number; col: number } | null {
  const words = wordDirection === "across" ? data.acrossWords : data.downWords;
  const currentWord = getWordContaining(data, currentRow, currentCol, wordDirection);
  
  if (!currentWord || words.length === 0) return null;

  // Sort words by clue number to get the sequential order
  const sortedWords = [...words].sort((a, b) => a.clueNumber - b.clueNumber);
  
  // Find current word index
  const currentIndex = sortedWords.findIndex(w => w.id === currentWord.id);
  if (currentIndex === -1) return null;

  // Search through words starting from the next one
  // We'll check all words (wrapping around) to find one with an empty cell
  for (let i = 1; i <= sortedWords.length; i++) {
    const nextIndex = (currentIndex + i) % sortedWords.length;
    const nextWord = sortedWords[nextIndex];
    
    // Find the first empty cell in this word
    for (const cell of nextWord.cells) {
      const key = `${cell.row},${cell.col}`;
      if (!userInputs[key]) {
        return { row: cell.row, col: cell.col };
      }
    }
  }

  // All words are filled
  return null;
}

/**
 * Get the next word in the same direction, ordered by clue number.
 * Tab goes to the next word sequentially, Shift+Tab goes to the previous.
 * When reaching the end of across words, wraps to first down word (and vice versa).
 * Returns the first cell of the next word and the new direction.
 * 
 * @param reverse - If true, go to previous word instead of next (Shift+Tab)
 */
export function getNextWordCell(
  data: CrosswordData,
  currentRow: number,
  currentCol: number,
  wordDirection: WordDirection,
  reverse: boolean = false
): { row: number; col: number; newDirection: WordDirection } | null {
  const cell = getCellAt(data, currentRow, currentCol);
  if (!cell || cell.type === "black") return null;

  const words = wordDirection === "across" ? data.acrossWords : data.downWords;
  const currentWordId = wordDirection === "across" ? cell.acrossWordId : cell.downWordId;
  
  if (currentWordId === undefined || words.length === 0) return null;

  // Sort words by clue number
  const sortedWords = [...words].sort((a, b) => a.clueNumber - b.clueNumber);

  // Find current word index
  const currentIndex = sortedWords.findIndex(w => w.id === currentWordId);
  if (currentIndex === -1) return null;

  // Check if we need to wrap to the other direction
  const isAtEnd = !reverse && currentIndex === sortedWords.length - 1;
  const isAtStart = reverse && currentIndex === 0;

  if (isAtEnd || isAtStart) {
    // Wrap to the other direction
    const otherDirection: WordDirection = wordDirection === "across" ? "down" : "across";
    const otherWords = otherDirection === "across" ? data.acrossWords : data.downWords;
    const sortedOtherWords = [...otherWords].sort((a, b) => a.clueNumber - b.clueNumber);
    
    if (sortedOtherWords.length === 0) return null;
    
    // Get first word (for Tab at end) or last word (for Shift+Tab at start)
    const targetWord = isAtEnd ? sortedOtherWords[0] : sortedOtherWords[sortedOtherWords.length - 1];
    if (!targetWord || targetWord.cells.length === 0) return null;
    
    const targetCell = targetWord.cells[0];
    return { row: targetCell.row, col: targetCell.col, newDirection: otherDirection };
  }

  // Normal navigation within same direction
  const nextIndex = reverse ? currentIndex - 1 : currentIndex + 1;
  const nextWord = sortedWords[nextIndex];
  if (!nextWord || nextWord.cells.length === 0) return null;

  // Return the first cell of the next word
  const firstCell = nextWord.cells[0];
  return { row: firstCell.row, col: firstCell.col, newDirection: wordDirection };
}
