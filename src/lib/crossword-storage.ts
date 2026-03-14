/**
 * Persist crossword progress in localStorage so it survives refresh and return visits.
 * Validates saved data against the current grid and version.
 */

import type { CrosswordData } from "./crossword-data";
import { CROSSWORD_VERSION, isLetterCell } from "./crossword-data";

const STORAGE_KEY = "crossword-progress";

export interface CrosswordProgress {
  version: number;
  userInputs: Record<string, string>;
  selection: { row: number; col: number; direction: "across" | "down" } | null;
}

function parseStored(raw: string | null): CrosswordProgress | null {
  if (raw == null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as CrosswordProgress).version === "number" &&
      typeof (parsed as CrosswordProgress).userInputs === "object" &&
      (parsed as CrosswordProgress).userInputs !== null
    ) {
      return parsed as CrosswordProgress;
    }
  } catch {
    // ignore invalid JSON
  }
  return null;
}

/**
 * Validate userInputs: only keep entries for (row,col) that are letter cells in the current grid.
 */
function validateUserInputs(
  data: CrosswordData,
  userInputs: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(userInputs)) {
    const match = /^(\d+),(\d+)$/.exec(key);
    if (!match) continue;
    const row = parseInt(match[1], 10);
    const col = parseInt(match[2], 10);
    if (!isLetterCell(data, row, col)) continue;
    const letter = String(userInputs[key]).toUpperCase().slice(0, 1);
    if (letter) out[key] = letter;
  }
  return out;
}

/**
 * Validate selection: must be a letter cell; otherwise return null.
 */
function validateSelection(
  data: CrosswordData,
  selection: CrosswordProgress["selection"],
): CrosswordProgress["selection"] {
  if (selection == null) return null;
  const { row, col, direction } = selection;
  if (
    typeof row !== "number" ||
    typeof col !== "number" ||
    (direction !== "across" && direction !== "down")
  ) {
    return null;
  }
  if (!isLetterCell(data, row, col)) return null;
  return { row, col, direction };
}

/**
 * Load progress from localStorage. Call only in the browser (e.g. in useEffect).
 * Returns null if no stored data, wrong version, or invalid.
 */
export function loadProgress(data: CrosswordData): CrosswordProgress | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const stored = parseStored(raw);
  if (stored == null || stored.version !== CROSSWORD_VERSION) return null;
  return {
    version: CROSSWORD_VERSION,
    userInputs: validateUserInputs(data, stored.userInputs),
    selection: validateSelection(data, stored.selection ?? null),
  };
}

/**
 * Save progress to localStorage. Call only in the browser (e.g. in useEffect).
 */
export function saveProgress(
  progress: Omit<CrosswordProgress, "version">,
): void {
  if (typeof window === "undefined") return;
  const payload: CrosswordProgress = {
    version: CROSSWORD_VERSION,
    userInputs: progress.userInputs,
    selection: progress.selection ?? null,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota exceeded or disabled; ignore
  }
}
