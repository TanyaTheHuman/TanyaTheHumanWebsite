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
const GRID_LAYOUT = [
  "O...B..H.F...A.D.", // Row 1
  "SYSTEMSTHINKER.A.", // Row 2
  "L...K..M.X...G.S.", // Row 3
  "O.C.ITALIA.SOUTH.", // Row 4
  "N.U.N....T.C.E...", // Row 5
  "O.R.DELIVEROO.JA.", // Row 6
  "RUSK.......R...B.", // Row 7
  "W.O..H....OPINION", // Row 8
  "AFRICA.B...I...U.", // Row 9
  "Y....DELTA.OWNIT.", // Row 10
  "..A..E.A.N...E.M.", // Row 11 - +ANDROID(col10)
  "..PRODUCTDESIGNER", // Row 12
  "..P..A.K.R...R...", // Row 13
  "..S.G..CROSSWORDS", // Row 14
  "....R..A.I...N...", // Row 15
  "...UIKIT.D.SKIING", // Row 16
  ".F..D...L........", // Row 17
  "VIPPS..NORWEGIAN.", // Row 18
  ".G.A.C..N.H..D..B", // Row 19
  ".M.S.O..D.I..E..A", // Row 20
  ".AUTOLAYOUT.KAYAK", // Row 21
  "...A.D..N.E..L..E", // Row 22
];

function isBlack(row: number, col: number): boolean {
  if (row < 0 || row >= GRID_LAYOUT.length) return true;
  const rowStr = GRID_LAYOUT[row];
  if (col < 0 || col >= rowStr.length) return true;
  return rowStr[col] === ".";
}

function getLetter(row: number, col: number): string | undefined {
  if (row < 0 || row >= GRID_LAYOUT.length) return undefined;
  const rowStr = GRID_LAYOUT[row];
  if (col < 0 || col >= rowStr.length) return undefined;
  const char = rowStr[col];
  if (char === "." || char === "_") return undefined;
  return char;
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
  21: "Take responsibility for it!",
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
  4: "To obsess over something",
  5: "To dispute or disagree",
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

export function getCrosswordData(): CrosswordData {
  const cells: CrosswordCell[][] = [];

  for (let r = 0; r < ROWS; r++) {
    cells[r] = [];
    for (let c = 0; c < COLS; c++) {
      const type: CellType = isBlack(r, c) ? "black" : "letter";
      cells[r][c] = {
        row: r,
        col: c,
        type,
        letter: getLetter(r, c),
      };
    }
  }

  const { acrossWords, downWords } = buildWordsFromGrid(cells);

  // Assign clue numbers to cells that start words
  // Scan left-to-right, top-to-bottom
  let clueNumber = 1;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r][c];
      if (cell.type !== "letter") continue;

      // Check if this cell starts an across word
      const startsAcross =
        (c === 0 || cells[r][c - 1].type === "black") &&
        (c < COLS - 1 && cells[r][c + 1].type === "letter");

      // Check if this cell starts a down word
      const startsDown =
        (r === 0 || cells[r - 1][c].type === "black") &&
        (r < ROWS - 1 && cells[r + 1][c].type === "letter");

      if (startsAcross || startsDown) {
        cell.number = clueNumber;
        
        // Update the word's clueNumber and clue text
        if (startsAcross && cell.acrossWordId !== undefined) {
          acrossWords[cell.acrossWordId].clueNumber = clueNumber;
          acrossWords[cell.acrossWordId].clue = ACROSS_CLUE_MAP[clueNumber] || `Across clue ${clueNumber}`;
        }
        if (startsDown && cell.downWordId !== undefined) {
          downWords[cell.downWordId].clueNumber = clueNumber;
          downWords[cell.downWordId].clue = DOWN_CLUE_MAP[clueNumber] || `Down clue ${clueNumber}`;
        }
        
        clueNumber++;
      }
    }
  }

  return {
    rows: ROWS,
    cols: COLS,
    cells,
    acrossWords,
    downWords,
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
