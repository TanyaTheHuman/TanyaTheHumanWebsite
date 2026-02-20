/**
 * Crossword data types and placeholder 17x23 grid.
 * Replace with actual crossword design data when ready.
 */

export type CellType = "letter" | "black";

export interface CrosswordCell {
  row: number;
  col: number;
  type: CellType;
  letter?: string;
  number?: number;
  acrossWordId?: number;
  downWordId?: number;
}

export interface CrosswordWord {
  id: number;
  clueNumber: number;
  clue: string;
  cells: { row: number; col: number }[];
}

export interface CrosswordData {
  rows: number;
  cols: number;
  cells: CrosswordCell[][];
  acrossWords: CrosswordWord[];
  downWords: CrosswordWord[];
}

const COLS = 17;
const ROWS = 22;

/**
 * Grid layout from the actual crossword design.
 * Each string represents a row: letters = letter cells, '.' = black cells
 * Grid is 17 columns × 23 rows
 */
// Grid: 7 cells blacked (ARGUE/DELTA/OWNIT); 4-down FIXATE removed, UNO added at col 10 (1-based)
const GRID_LAYOUT = [
  "O...B..H..U....D.", // Row 1 (1-based): U starts UNO down at col 10
  "SYSTEMSTHINKER.A.", // Row 2
  "L...K..M..O....S.", // Row 3: O at col 11 (index 10) for UNO
  "O.C.ITALIA.SOUTH.", // Row 4
  "N.U.N......C.....", // Row 5
  "O.R.DELIVEROO.JA.", // Row 6
  "RUSK....H..R...B.", // Row 7: H of VHS
  "W.O..H..S.OPINION", // Row 8: S of VHS
  "AFRICA.B...I...U.", // Row 9
  "Y....D.L.A.O.N.T.", // Row 10
  "..A..E.A.N...E.M.", // Row 10
  "..PRODUCTDESIGNER", // Row 11
  "..P..A.K.R...R...", // Row 12
  "..S.G..CROSSWORDS", // Row 13
  "....R..A.I.I.N...", // Row 15
  "...UIKIT.D.SKIING", // Row 16
  ".F..D...L..T.....", // Row 17
  "VIPPS..NORWEGIAN.", // Row 18
  ".G.A.C..N..R.D..B", // Row 19
  ".M.S.O..D....E..A", // Row 20
  ".AUTOLAYOUT.KAYAK", // Row 21
  "...A.D..N....S..E", // Row 22
];

function isBlackInLayout(row: number, col: number, layout: string[]): boolean {
  if (row < 0 || row >= layout.length) return true;
  const rowStr = layout[row];
  if (col < 0 || col >= rowStr.length) return true;
  return rowStr[col] === ".";
}

function getLetterFromLayout(row: number, col: number, layout: string[]): string | undefined {
  if (row < 0 || row >= layout.length) return undefined;
  const rowStr = layout[row];
  if (col < 0 || col >= rowStr.length) return undefined;
  const char = rowStr[col];
  if (char === "." || char === "_") return undefined;
  return char;
}

function buildCellsFromLayout(layout: string[]): CrosswordCell[][] {
  const out: CrosswordCell[][] = [];
  for (let r = 0; r < layout.length; r++) {
    out[r] = [];
    for (let c = 0; c < layout[r].length; c++) {
      const type: CellType = isBlackInLayout(r, c, layout) ? "black" : "letter";
      out[r][c] = {
        row: r,
        col: c,
        type,
        letter: getLetterFromLayout(r, c, layout),
      };
    }
  }
  return out;
}

// Placeholder clues - keyed by the clue NUMBER shown in the grid
// Replace with real clues later
const ACROSS_CLUE_MAP: Record<number, string> = {
  7: "One who sees the big picture and all its parts",
  9: "Boot-shaped country",
  10: "Direction of penguins and polar bears",
  11: "Food delivery app founded in London",
  12: "Short affirmative in German",
  14: "Crunchy baby biscuit",
  17: "A viewpoint or belief",
  18: "Continent with 54 countries",
  20: "River formation or airline alliance",
  24: "Designer of digital experiences",
  27: "Puzzles with interlocking words",
  29: "Apple's interface framework",
  30: "Winter sport on slopes",
  31: "Norwegian payment app",
  32: "Scandinavian language",
  35: "Adaptive iOS layout system",
  37: "Palindromic boat",
};

const DOWN_CLUE_MAP: Record<number, string> = {
  1: "Capital city + country combination",
  2: "Opposite of being cruel",
  3: "Web's markup language",
  4: "Card game with a Draw Four", // UNO (replaces FIXATE)
  6: "A quick sprint or punctuation",
  8: "Blinking text indicator",
  13: "Zodiac sign of the scorpion",
  15: "Personal website section",
  16: "Noisy African bird",
  19: "Superstitious feline",
  22: "Classic Italian cocktail",
  23: "Software on your phone",
  25: "Google's mobile OS",
  26: "Layout systems with rows and columns",
  28: "Design tool by Dylan Field",
  33: "UK's capital city",
  34: "Italian noodle dish",
  36: "Absence of color",
  38: "Perfect or optimal",
  39: "Low temperature",
  40: "Cook in an oven",
};

function buildWordsFromGrid(cells: CrosswordCell[][]): {
  acrossWords: CrosswordWord[];
  downWords: CrosswordWord[];
} {
  const acrossWords: CrosswordWord[] = [];
  const downWords: CrosswordWord[] = [];
  let acrossId = 0;
  let downId = 0;

  // Build across words (left to right)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r][c];
      if (cell.type !== "letter") continue;

      const isStartOfAcross =
        c === 0 || cells[r][c - 1].type === "black";
      const hasRightNeighbor =
        c < COLS - 1 && cells[r][c + 1].type === "letter";

      if (isStartOfAcross && hasRightNeighbor) {
        const wordCells: { row: number; col: number }[] = [];
        let col = c;
        while (col < COLS && cells[r][col].type === "letter") {
          wordCells.push({ row: r, col });
          cells[r][col].acrossWordId = acrossId;
          col++;
        }
        acrossWords.push({
          id: acrossId,
          clueNumber: 0, // Will be set later based on cell number
          clue: "", // Will be set later based on clue number
          cells: wordCells,
        });
        acrossId++;
      }
    }
  }

  // Build down words (top to bottom)
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const cell = cells[r][c];
      if (cell.type !== "letter") continue;

      const isStartOfDown =
        r === 0 || cells[r - 1][c].type === "black";
      const hasDownNeighbor =
        r < ROWS - 1 && cells[r + 1][c].type === "letter";

      if (isStartOfDown && hasDownNeighbor) {
        const wordCells: { row: number; col: number }[] = [];
        let row = r;
        while (row < ROWS && cells[row][c].type === "letter") {
          wordCells.push({ row, col: c });
          cells[row][c].downWordId = downId;
          row++;
        }
        downWords.push({
          id: downId,
          clueNumber: 0, // Will be set later based on cell number
          clue: "", // Will be set later based on clue number
          cells: wordCells,
        });
        downId++;
      }
    }
  }

  return { acrossWords, downWords };
}

// Remnant words to remove: RU (down col 13), WHITE (32 down), DLA/ONT (across row 9)
function isRemovedDownWord(w: CrosswordWord, cells: CrosswordCell[][]): boolean {
  const wordStr = w.cells
    .map((c) => cells[c.row][c.col].letter ?? "")
    .join("");
  if (wordStr === "WHITE") return true;
  return (
    w.cells.length === 2 &&
    w.cells[0].col === 13 &&
    w.cells[0].row === 1 &&
    w.cells[1].row === 3
  );
}
function isRemovedAcrossWord(w: CrosswordWord): boolean {
  if (w.cells.length !== 3 || w.cells[0].row !== 9) return false;
  const cols = w.cells.map((c) => c.col).sort((a, b) => a - b);
  return (
    (cols[0] === 5 && cols[1] === 7 && cols[2] === 9) ||
    (cols[0] === 11 && cols[1] === 13 && cols[2] === 15)
  );
}

export function getCrosswordData(): CrosswordData {
  const cells = buildCellsFromLayout(GRID_LAYOUT);
  const { acrossWords, downWords } = buildWordsFromGrid(cells);

  // Assign initial clue numbers in scan order (left-to-right, top-to-bottom)
  let clueNumber = 1;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r][c];
      if (cell.type !== "letter") continue;

      const startsAcross =
        (c === 0 || cells[r][c - 1].type === "black") &&
        c < COLS - 1 &&
        cells[r][c + 1].type === "letter";
      const startsDown =
        (r === 0 || cells[r - 1][c].type === "black") &&
        r < ROWS - 1 &&
        cells[r + 1][c].type === "letter";

      if (startsAcross || startsDown) {
        cell.number = clueNumber;
        if (startsAcross && cell.acrossWordId !== undefined) {
          acrossWords[cell.acrossWordId].clueNumber = clueNumber;
          acrossWords[cell.acrossWordId].clue =
            ACROSS_CLUE_MAP[clueNumber] || `Across clue ${clueNumber}`;
        }
        if (startsDown && cell.downWordId !== undefined) {
          downWords[cell.downWordId].clueNumber = clueNumber;
          downWords[cell.downWordId].clue =
            DOWN_CLUE_MAP[clueNumber] || `Down clue ${clueNumber}`;
        }
        clueNumber++;
      }
    }
  }

  // Remove remnant words (ex-5dn RU, ex-32dn WHITE, ex-19ac DLA, ex-21ac ONT)
  const keptDown = downWords.filter((w) => !isRemovedDownWord(w, cells));
  const keptAcross = acrossWords.filter((w) => !isRemovedAcrossWord(w));

  const newDownWords: CrosswordWord[] = keptDown.map((w, i) => ({ ...w, id: i }));
  const newAcrossWords: CrosswordWord[] = keptAcross.map((w, i) => ({ ...w, id: i }));

  const removedDownIds = new Set(
    downWords.filter((w) => isRemovedDownWord(w, cells)).map((w) => w.id)
  );
  const removedAcrossIds = new Set(
    acrossWords.filter(isRemovedAcrossWord).map((w) => w.id)
  );
  const oldDownToNew = new Map<number, number>();
  keptDown.forEach((w, i) => oldDownToNew.set(w.id, i));
  const oldAcrossToNew = new Map<number, number>();
  keptAcross.forEach((w, i) => oldAcrossToNew.set(w.id, i));

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r][c];
      if (cell.type !== "letter") continue;
      if (cell.acrossWordId !== undefined) {
        cell.acrossWordId = removedAcrossIds.has(cell.acrossWordId)
          ? undefined
          : oldAcrossToNew.get(cell.acrossWordId);
      }
      if (cell.downWordId !== undefined) {
        cell.downWordId = removedDownIds.has(cell.downWordId)
          ? undefined
          : oldDownToNew.get(cell.downWordId);
      }
    }
  }

  // Renumber clues 1..N with no gaps (removed word starts have undefined word id, so skip them)
  let nextNumber = 1;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r][c];
      if (cell.type !== "letter") continue;

      const startsAcross =
        (c === 0 || cells[r][c - 1].type === "black") &&
        c < COLS - 1 &&
        cells[r][c + 1].type === "letter";
      const startsDown =
        (r === 0 || cells[r - 1][c].type === "black") &&
        r < ROWS - 1 &&
        cells[r + 1][c].type === "letter";

      if (startsAcross || startsDown) {
        const hasKeptWord =
          (startsAcross && cell.acrossWordId !== undefined) ||
          (startsDown && cell.downWordId !== undefined);

        if (hasKeptWord) {
          cell.number = nextNumber;
          if (startsAcross && cell.acrossWordId !== undefined) {
            newAcrossWords[cell.acrossWordId].clueNumber = nextNumber;
          }
          if (startsDown && cell.downWordId !== undefined) {
            newDownWords[cell.downWordId].clueNumber = nextNumber;
          }
          nextNumber++;
        } else {
          cell.number = undefined;
        }
      }
    }
  }

  // Set each word's clue to its answer (letters from grid)
  const letterAt = (row: number, col: number) => cells[row][col].letter ?? "";
  for (const w of newAcrossWords) {
    w.clue = w.cells.map((c) => letterAt(c.row, c.col)).join("");
  }
  for (const w of newDownWords) {
    w.clue = w.cells.map((c) => letterAt(c.row, c.col)).join("");
  }

  return {
    rows: ROWS,
    cols: COLS,
    cells,
    acrossWords: newAcrossWords,
    downWords: newDownWords,
  };
}

export function getCellAt(
  data: CrosswordData,
  row: number,
  col: number
): CrosswordCell | null {
  if (row < 0 || row >= data.rows || col < 0 || col >= data.cols) {
    return null;
  }
  return data.cells[row][col];
}

export function getWordContaining(
  data: CrosswordData,
  row: number,
  col: number,
  direction: "across" | "down"
): CrosswordWord | null {
  const cell = getCellAt(data, row, col);
  if (!cell || cell.type === "black") return null;

  const wordId =
    direction === "across" ? cell.acrossWordId : cell.downWordId;
  if (wordId === undefined) return null;

  const words =
    direction === "across" ? data.acrossWords : data.downWords;
  return words[wordId] ?? null;
}

export function getActiveWordCells(
  data: CrosswordData,
  selectedRow: number,
  selectedCol: number,
  direction: "across" | "down"
): Set<string> {
  const word = getWordContaining(data, selectedRow, selectedCol, direction);
  if (!word) return new Set();
  return new Set(
    word.cells.map((c) => `${c.row},${c.col}`)
  );
}
