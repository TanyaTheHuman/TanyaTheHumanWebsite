# Crossword changes summary (handoff for next agent)

## What we did

### 1. Removed three words and blacked only specific cells
- **Down 5 (ARGUE):** Blacked only the cells with **A, G, E** (kept R and U so crossing words like SYSTEMSTHINKER keep their letters).
- **Across 19 (DELTA):** Blacked only **E and T** (kept D, L, A for crossing down words).
- **Across 21 (OWNIT):** Blacked only **W and I** (kept O, N, T for crossing down words).

We did **not** black any cell that is used by another word. The grid has **17 columns × 22 rows** and that did not change.

### 2. Removed those three clues and renumbered
- Down 5, Across 19, and Across 21 were removed from the clue lists.
- Clue numbers were renumbered in scan order (left-to-right, top-to-bottom) so the list has no gaps (1, 2, 3, … N).
- Remnant “words” (e.g. R-U where ARGUE was, D-L-A and O-N-T where DELTA/OWNIT were) are filtered out by `isRemovedDownWord` / `isRemovedAcrossWord` in `src/lib/crossword-data.ts`.

### 3. Added down word VHS
- **Position (1-based):** Starts at **row 6, col 9**. The V was already there; we added **H** and **S** in the two cells directly below (rows 7 and 8, col 9).
- We only **replaced** two black cells with H and S. We did not add or remove rows/columns.
- Clue for VHS: **"Old video format"** (constant `CLUE_VHS`). The word is detected by its letters (`"VHS"`) and assigned this clue after renumbering.
- The **V** cell gets a clue number in the top-left; numbering is handled by the existing renumbering loop in `getCrosswordData()`.

### 4. Correct row 6 string for VHS and neighbors
- Row 6 (0-based index 6 in `GRID_LAYOUT`) must be exactly: **`"RUSK....H..R...B."`**
- That keeps **H** at column 9 (1-based), and keeps **R** (e.g. SCORPIO) and **B** (e.g. ABOUT ME) in their correct columns. Any other spacing (e.g. `H.R` or extra dots at the end) shifts R and B and is wrong.

---

## How to avoid mistakes

### Grid layout (GRID_LAYOUT in `src/lib/crossword-data.ts`)
- **Only replace characters in place.** Do **not** add or remove characters to “fix” length. Every row must stay **exactly 17 characters**. If you replace one letter with a `.` or one `.` with a letter, the row length must still be 17.
- **Do not add “fix” dots** at the start or end of a row to fix undefined cell errors. If you get `cells[r][c]` undefined, the cause is a row with the wrong length; fix that row by correcting the in-place replacement, not by padding.
- **Column positions:** In a row string, **index 0 = column 1 (1-based)**, so **index 8 = column 9 (1-based)**. When the user says “col 9”, use index **8** in the string. Count carefully so you don’t put a letter at index 9 (column 10) when they asked for column 9.

### 1-based vs 0-based
- **User / puzzle:** Rows and columns are **1-based** (e.g. “row 6, col 9” = 6th row, 9th column).
- **Code / GRID_LAYOUT:** Rows and columns are **0-based**. So “row 6, col 9” in user terms = **row index 5, column index 8** in the array (row 6 = 6th row = index 5; col 9 = 9th column = index 8).
- In `GRID_LAYOUT`, `layout[5]` is the **6th row** (1-based row 6). The 9th character in that string (index 8) is **column 9** (1-based).

### Crossing words
- Do **not** black out a cell that is used by another word. For example, the E of DELTA at (9,6) is also the H of DASH (down); blacking it would break DASH. When removing letters from a word, only black cells that are **not** shared with another word, or the user must explicitly accept breaking the other word.

### Clue numbering and cell numbers
- Clue numbers are assigned in **scan order** (left-to-right, top-to-bottom) to every cell that **starts** an across and/or down word. The same number can be used for both (e.g. 10 Across and 10 Down).
- After filtering out removed words, we **renumber** so the list has no gaps (1, 2, … N). Each word’s `clueNumber` and each word-start cell’s `cell.number` are set in that renumbering loop. Any new word (like VHS) that starts at a cell will get a number automatically as long as it’s not filtered out.
- The clue list is built from `data.acrossWords` and `data.downWords` sorted by `clueNumber`. No separate “clue list” structure needs to be updated when adding a word; the word is in the array and gets a `clueNumber` when renumbering runs.

### When editing a single row string
- Count the exact number of characters before and after your change. Replacing one character with one character keeps length. If you add or remove a dot “to fix” something, you will shift other letters (e.g. R and B in row 6) and break crossing words or clue positions. Use the user’s exact string when they provide it (e.g. `"RUSK....H..R...B."`).

---

## Where things live

- **Grid and words:** `src/lib/crossword-data.ts`
  - `GRID_LAYOUT`: array of 22 strings, each length 17. `.` = black, letter = letter cell.
  - `getCrosswordData()`: builds cells from layout, builds words, assigns clue numbers, filters removed words (RU, DLA, ONT), renumbers 1..N, sets VHS clue.
  - `isRemovedDownWord` / `isRemovedAcrossWord`: identify the remnant words to exclude from the clue list.
  - `ACROSS_CLUE_MAP` / `DOWN_CLUE_MAP`: clue text by clue number (used during initial numbering; some clues like VHS are set later by word content).
- **Rendering:** `src/components/CrosswordGrid.tsx`, `CrosswordCell.tsx`. Cell’s top-left number comes from `cell.number` (set in `getCrosswordData()`).
- **Clue list:** `src/components/CrosswordSection.tsx` uses `data.acrossWords` and `data.downWords` sorted by `clueNumber`.

---

## Current state

- **Grid:** 17×22; 7 cells blacked for ARGUE/DELTA/OWNIT; 2 cells turned from black to H and S for VHS at col 9 (1-based), rows 6–8.
- **Clues:** 35 total (renumbered with no gaps). VHS is one of the down clues with text “Old video format”.
- **Row 6 (0-based) in GRID_LAYOUT:** Must remain `"RUSK....H..R...B."` so H is at col 9 and R/B stay correct.

Use this doc and `docs/crossword-clue-numbering.md` when making further crossword edits.
