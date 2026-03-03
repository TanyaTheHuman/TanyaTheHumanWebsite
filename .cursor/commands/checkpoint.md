# Checkpoint Commit

Create a checkpoint commit to save the current progress.

## Steps

1. **Stage changes**: Run `git add` for all modified and new files. Do not stage unwanted files (e.g. `node_modules`, build artifacts, `.env`).

2. **Create commit**: Run `git commit` with a descriptive message that summarizes what was done recently. The message should be clear and specific (e.g. "Add mobile clue navigation with prev/next chevrons" or "Fix cell highlight overlay above keyboard").

3. **Confirm**: After the commit, tell the user the commit hash and a brief summary.

## Example commit messages

- "Add mobile clue navigation with prev/next chevrons"
- "Fix cell highlight overlay above keyboard on mobile"
- "Convert custom CSS to Tailwind in CrosswordSection"
- "Checkpoint: [brief description of work]"

## Notes

- If there are no changes to commit, say so and do nothing.
- If the user provided additional context after `/checkpoint`, incorporate it into the commit message.
