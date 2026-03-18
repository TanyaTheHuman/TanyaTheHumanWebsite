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

/** Bump when grid or clues change so old localStorage progress is ignored. */
export const CROSSWORD_VERSION = 10;

const COLS = 17;
const ROWS = 19;

/**
 * Grid layout from the actual crossword design.
 * Each string represents a row: letters = letter cells, '.' = black cells
 * Grid is 17 columns × 19 rows
 */
// Grid: 7 cells blacked (ARGUE/DELTA/OWNIT); 4-down FIXATE removed, UNO added at col 10 (1-based)
const GRID_LAYOUT = [
  "..C....KAYAK.....", // Row 1
  "N.U.......F.S....", // Row 2
  "O.R.DELIVEROO.CAT", // Row 3
  "RUSK...T..I.U..B.", // Row 4
  "W.O..H.A..C.T..O.", // Row 5
  "A.R..A.L..A.H..U.", // Row 6
  "Y....D.Y.A...N.T.", // Row 7
  "..A..E...N...E.M.", // Row 8
  "..PRODUCTDESIGNER", // Row 9
  "..P..A...R...R...", // Row 10
  "VHS.G..CROSSWORDS", // Row 11
  "....R....I.I.N..E", // Row 12: E of SEW
  "..SKIING.D.S.I..W", // Row 13
  ".F..D...L..T..B..", // Row 14
  "VIPPS..NORWEGIAN.", // Row 15
  ".G.A.C..N..R..K..", // Row 16
  ".M.S.O..D.....I..", // Row 17
  ".AUTOLAYOUT...N..", // Row 18
  "...A.D..N.....G..", // Row 19
];

function isBlackInLayout(row: number, col: number, layout: string[]): boolean {
  if (row < 0 || row >= layout.length) return true;
  const rowStr = layout[row];
  if (col < 0 || col >= rowStr.length) return true;
  return rowStr[col] === ".";
}

function getLetterFromLayout(
  row: number,
  col: number,
  layout: string[],
): string | undefined {
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

interface ClueEntry {
  clueNumber: number;
  answer: string;
  clue: string;
}

const ACROSS_CLUES: ClueEntry[] = [
  {
    clueNumber: 2,
    answer: "KAYAK",
    clue: "Once paddled one of these (unknowingly) across a shipping lane in Hạ Long Bay",
  },
  {
    clueNumber: 6,
    answer: "DELIVEROO",
    clue: "Food delivery company, founded in the UK",
  },
  {
    clueNumber: 8,
    answer: "CAT",
    clue: "A small, black one of these likes to sit on my keyboard",
  },
  { clueNumber: 10, answer: "RUSK", clue: "Like a biscotti, but Afrikaans" },
  {
    clueNumber: 15,
    answer: "PRODUCTDESIGNER",
    clue: "Automator of layouts and drawer of rectangles",
  },
  {
    clueNumber: 16,
    answer: "VHS",
    clue: "I'm old enough to remember renting movies in this format",
  },
  {
    clueNumber: 18,
    answer: "CROSSWORDS",
    clue: "My favourite word puzzles (in case you haven't noticed)",
  },
  {
    clueNumber: 21,
    answer: "SKIING",
    clue: "Still bad at this despite 5 snowy winters in 4-down",
  },
  {
    clueNumber: 25,
    answer: "VIPPS",
    clue: "Before 6-across, I was at one of Scandinavia's most successful fintechs",
  },
  {
    clueNumber: 27,
    answer: "NORWEGIAN",
    clue: "Jeg snakker litt av dette språket fordi jeg bodd i 4-down for fem år",
  },
  {
    clueNumber: 29,
    answer: "AUTOLAYOUT",
    clue: "It definitely fills my container, if you know what I mean",
  },
];

const DOWN_CLUES: ClueEntry[] = [
  {
    clueNumber: 1,
    answer: "CURSOR",
    clue: "Tool I fought with to create what you see here",
  },
  { clueNumber: 3, answer: "AFRICA", clue: "See 4-across" },
  {
    clueNumber: 4,
    answer: "NORWAY",
    clue: "My first overseas trip was a one-way ticket to the fjords",
  },
  {
    clueNumber: 5,
    answer: "SOUTH",
    clue: "With 3-down, born and raised in this sunny country",
  },
  {
    clueNumber: 7,
    answer: "ITALY",
    clue: "Boot-shaped country that makes up half of my heritage",
  },
  { clueNumber: 9, answer: "ABOUTME", clue: "Theme of this puzzle" },
  {
    clueNumber: 11,
    answer: "HADEDA",
    clue: "Large Ibis known local to my home country",
  },
  {
    clueNumber: 12,
    answer: "ANDROID",
    clue: "Rare to meet a 15-across that uses this mobile OS",
  },
  {
    clueNumber: 13,
    answer: "NEGRONI",
    clue: "The Sbagliato version is a mistake",
  },
  {
    clueNumber: 14,
    answer: "APPS",
    clue: "This plus tooling and web design make up my portfolio",
  },
  {
    clueNumber: 17,
    answer: "GRIDS",
    clue: "This puzzle's construction relies on this structure",
  },
  {
    clueNumber: 19,
    answer: "SISTER",
    clue: "I'm a big one of these by 4 years",
  },
  {
    clueNumber: 20,
    answer: "SEW",
    clue: "Taught myself to do this so I could make my own clothes",
  },
  { clueNumber: 22, answer: "FIGMA", clue: "One of the tools of my trade" },
  {
    clueNumber: 23,
    answer: "LONDON",
    clue: "Currently living in this stereotypically grey capital city",
  },
  {
    clueNumber: 26,
    answer: "PASTA",
    clue: "The noodle of my people over at 6-down",
  },
  {
    clueNumber: 28,
    answer: "COLD",
    clue: "My unusual personal preference when it comes to toast",
  },
  {
    clueNumber: 24,
    answer: "BAKING",
    clue: "Not a fan of doing this, tsps and cups are too fiddly",
  },
];

function buildClueMap(entries: ClueEntry[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const e of entries) map[e.answer] = e.clue;
  return map;
}

const ACROSS_CLUE_BY_ANSWER = buildClueMap(ACROSS_CLUES);
const DOWN_CLUE_BY_ANSWER = buildClueMap(DOWN_CLUES);

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

      const isStartOfAcross = c === 0 || cells[r][c - 1].type === "black";
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

      const isStartOfDown = r === 0 || cells[r - 1][c].type === "black";
      const hasDownNeighbor = r < ROWS - 1 && cells[r + 1][c].type === "letter";

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
function isRemovedDownWord(
  w: CrosswordWord,
  cells: CrosswordCell[][],
): boolean {
  const wordStr = w.cells.map((c) => cells[c.row][c.col].letter ?? "").join("");
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
          acrossWords[cell.acrossWordId].clue = "";
        }
        if (startsDown && cell.downWordId !== undefined) {
          downWords[cell.downWordId].clueNumber = clueNumber;
          downWords[cell.downWordId].clue = "";
        }
        clueNumber++;
      }
    }
  }

  // Remove remnant words (ex-5dn RU, ex-32dn WHITE, ex-19ac DLA, ex-21ac ONT)
  const keptDown = downWords.filter((w) => !isRemovedDownWord(w, cells));
  const keptAcross = acrossWords.filter((w) => !isRemovedAcrossWord(w));

  const newDownWords: CrosswordWord[] = keptDown.map((w, i) => ({
    ...w,
    id: i,
  }));
  const newAcrossWords: CrosswordWord[] = keptAcross.map((w, i) => ({
    ...w,
    id: i,
  }));

  const removedDownIds = new Set(
    downWords.filter((w) => isRemovedDownWord(w, cells)).map((w) => w.id),
  );
  const removedAcrossIds = new Set(
    acrossWords.filter(isRemovedAcrossWord).map((w) => w.id),
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

  // Set each word's clue from real clues (keyed by answer), fallback to answer
  const letterAt = (row: number, col: number) => cells[row][col].letter ?? "";
  for (const w of newAcrossWords) {
    const answer = w.cells.map((c) => letterAt(c.row, c.col)).join("");
    w.clue = ACROSS_CLUE_BY_ANSWER[answer] ?? answer;
  }
  for (const w of newDownWords) {
    const answer = w.cells.map((c) => letterAt(c.row, c.col)).join("");
    w.clue = DOWN_CLUE_BY_ANSWER[answer] ?? answer;
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
  col: number,
): CrosswordCell | null {
  if (row < 0 || row >= data.rows || col < 0 || col >= data.cols) {
    return null;
  }
  return data.cells[row][col];
}

/** True if (row, col) is a letter cell in the grid (for validating saved progress). */
export function isLetterCell(
  data: CrosswordData,
  row: number,
  col: number,
): boolean {
  const cell = getCellAt(data, row, col);
  return cell !== null && cell.type === "letter";
}

export function getWordContaining(
  data: CrosswordData,
  row: number,
  col: number,
  direction: "across" | "down",
): CrosswordWord | null {
  const cell = getCellAt(data, row, col);
  if (!cell || cell.type === "black") return null;

  const wordId = direction === "across" ? cell.acrossWordId : cell.downWordId;
  if (wordId === undefined) return null;

  const words = direction === "across" ? data.acrossWords : data.downWords;
  return words[wordId] ?? null;
}

export function getWordByClueNumber(
  data: CrosswordData,
  clueNumber: number,
  direction: "across" | "down",
): CrosswordWord | null {
  const words = direction === "across" ? data.acrossWords : data.downWords;
  return words.find((w) => w.clueNumber === clueNumber) ?? null;
}

/**
 * Returns the correct answer for a clue from the grid (solution letters).
 * Used for validation so we only show filled words in the hero when they are correct.
 */
export function getCorrectWord(
  data: CrosswordData,
  clueNumber: number,
  direction: "across" | "down",
): string {
  const word = getWordByClueNumber(data, clueNumber, direction);
  if (!word?.cells.length) return "";
  return word.cells
    .map((c) => data.cells[c.row]?.[c.col]?.letter ?? "")
    .join("");
}

/**
 * Returns true if the user's filled word for a clue matches the correct answer (case-insensitive).
 */
export function isWordCorrect(
  data: CrosswordData,
  userInputs: Record<string, string>,
  clueNumber: number,
  direction: "across" | "down",
): boolean {
  const filled = getFilledWord(data, userInputs, clueNumber, direction);
  if (filled == null) return false;
  const correct = getCorrectWord(data, clueNumber, direction);
  return filled.toUpperCase() === correct.toUpperCase();
}

/**
 * Returns the filled-in word for a clue if every cell has user input; otherwise null.
 * Used e.g. to show "London" instead of "30-down" in the hero when the word is complete.
 */
export function getFilledWord(
  data: CrosswordData,
  userInputs: Record<string, string>,
  clueNumber: number,
  direction: "across" | "down",
): string | null {
  const word = getWordByClueNumber(data, clueNumber, direction);
  if (!word?.cells.length) return null;
  const letters: string[] = [];
  for (const c of word.cells) {
    const letter = userInputs[`${c.row},${c.col}`];
    if (!letter) return null;
    letters.push(letter);
  }
  return letters.join("");
}

/**
 * Returns a map of "clueNumber-direction" to filled word for every clue that is
 * complete and correct. Used for the hero subtitle so we only replace the reference
 * when the user has entered the right answer.
 */
export function getFilledWordsMap(
  data: CrosswordData,
  userInputs: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const w of data.acrossWords) {
    const filled = getFilledWord(data, userInputs, w.clueNumber, "across");
    if (filled && isWordCorrect(data, userInputs, w.clueNumber, "across")) {
      out[`${w.clueNumber}-across`] = filled;
    }
  }
  for (const w of data.downWords) {
    const filled = getFilledWord(data, userInputs, w.clueNumber, "down");
    if (filled && isWordCorrect(data, userInputs, w.clueNumber, "down")) {
      out[`${w.clueNumber}-down`] = filled;
    }
  }
  return out;
}

export function getActiveWordCells(
  data: CrosswordData,
  selectedRow: number,
  selectedCol: number,
  direction: "across" | "down",
): Set<string> {
  const word = getWordContaining(data, selectedRow, selectedCol, direction);
  if (!word) return new Set();
  return new Set(word.cells.map((c) => `${c.row},${c.col}`));
}

const CROSS_REF_PATTERN = /(\d+)-(across|down)/gi;

export function parseCrossReferences(
  clue: string,
): { clueNumber: number; direction: "across" | "down" }[] {
  const refs: { clueNumber: number; direction: "across" | "down" }[] = [];
  let match;
  CROSS_REF_PATTERN.lastIndex = 0;
  while ((match = CROSS_REF_PATTERN.exec(clue)) !== null) {
    refs.push({
      clueNumber: parseInt(match[1], 10),
      direction: match[2].toLowerCase() as "across" | "down",
    });
  }
  return refs;
}

export function getCrossReferencedCells(
  data: CrosswordData,
  word: CrosswordWord | null,
): Set<string> {
  if (!word) return new Set();
  const refs = parseCrossReferences(word.clue);
  if (refs.length === 0) return new Set();

  const cells = new Set<string>();
  for (const ref of refs) {
    const words =
      ref.direction === "across" ? data.acrossWords : data.downWords;
    const target = words.find((w) => w.clueNumber === ref.clueNumber);
    if (target) {
      for (const c of target.cells) {
        cells.add(`${c.row},${c.col}`);
      }
    }
  }
  return cells;
}
