# Crossword clue numbering and how to get clue words

1. **Clue number = the number in the corner of the cell**  
   When we say "the cell with 15 in the corner" or "clue 15", we mean the **clue number** (the small number in the top-left of the cell). It is not a row or column index. The same number can be used for both an across and a down clue (e.g. 10A and 10D).

2. **Row and column are 1-based in the puzzle**  
   When the user says "row 10, col 10" they mean the 10th row and 10th column (1-based). Do not convert to 0-based unless we're inside code that uses 0-based indices.

3. **How to get the word for a clue (e.g. 15 down)**  
   Use the **same logic as when the user clicks that clue in the list**:
   - Take the crossword data from `getCrosswordData()`.
   - Find the word with that clue number (e.g. in `data.downWords`, the word where `word.clueNumber === 15`).
   - That word has `word.cells` (the list of `{ row, col }` for that run).
   - The word string is: for each cell in `word.cells`, read the letter from the grid at that cell, then concatenate. In code: `word.cells.map(c => data.cells[c.row][c.col].letter || '').join('')`.  
   Do **not** re-derive "which cell has which number" from scan order; the word objects already tie clue number to cells.

4. **Full list of down words**  
   Sort `data.downWords` by `clueNumber`, then for each word compute the string as above. Do not infer words from clue text or from a separate "number → cell" mapping; use the existing word objects and grid letters.

5. **Do not assume scan order = intended puzzle**  
   The code assigns clue numbers in scan order; the user's intended puzzle may differ (e.g. "20 is at row 10, col 10"). When the user talks about "the cell with 13" or "15 down", use the data the app actually uses (the word with that `clueNumber` and its `word.cells`), not a separate scan-order derivation.
