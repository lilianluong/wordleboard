export interface ParsedWordle {
  wordleNumber: number;
  guesses: number;
  won: boolean;
  guessesGrid: string;
}

/**
 * Parses a Wordle emoji grid string to extract wordle number, guesses, and win status.
 * 
 * Expected format:
 * Wordle 1234 3/6
 * 
 * ⬛🟨⬛⬛⬛
 * 🟨🟩⬛⬛⬛
 * 🟩🟩🟩🟩🟩
 */
export function parseWordleGrid(input: string): ParsedWordle | null {
  try {
    const lines = input.trim().split("\n").filter((line) => line.trim());
    
    if (lines.length < 2) {
      return null;
    }

    // Parse first line: "Wordle 1,667 5/6" or "Wordle 1,667 5/6*" or "Wordle 1,667 X/6"
    const firstLine = lines[0];
    // Match wordle number with optional commas: "Wordle 1,667" -> "1,667"
    const wordleMatch = firstLine.match(/Wordle\s+([\d,]+)/i);
    // Match guesses: "5/6" or "5/6*" or "X/6" -> captures either number or "X"
    const guessesMatch = firstLine.match(/([X\d]+)\/(\d+)\*?/i);

    if (!wordleMatch || !guessesMatch) {
      return null;
    }

    // Remove commas from wordle number before parsing: "1,667" -> "1667"
    const wordleNumberStr = wordleMatch[1].replace(/,/g, '');
    const wordleNumber = parseInt(wordleNumberStr, 10);

    // Check if this is a failed attempt (X/6)
    const isFailure = guessesMatch[1].toUpperCase() === 'X';
    const guesses = isFailure ? 6 : parseInt(guessesMatch[1], 10); // Default to max guesses for failure
    const maxGuesses = parseInt(guessesMatch[2], 10);

    if (isNaN(wordleNumber) || (!isFailure && (isNaN(guesses) || guesses < 1 || guesses > maxGuesses))) {
      return null;
    }

    // Win/loss logic: X/6 means failure, otherwise it's a win.
    const won = !isFailure;

    // Extract emoji grid lines (skip the first line which contains "Wordle X Y/Z").
    const emojiRegex = /[🟩🟨⬛⬜]/;
    const emojiLines = lines.slice(1).filter(line => emojiRegex.test(line));
    const guessesGrid = emojiLines.join('\n');

    return {
      wordleNumber,
      guesses,
      won,
      guessesGrid,
    };
  } catch (error) {
    console.error("Error parsing Wordle grid:", error);
    return null;
  }
}
