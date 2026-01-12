export interface ParsedWordle {
  wordleNumber: number;
  guesses: number;
  won: boolean;
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

    // Parse first line: "Wordle 1,667 5/6" or "Wordle 1,667 5/6*"
    const firstLine = lines[0];
    // Match wordle number with optional commas: "Wordle 1,667" -> "1,667"
    const wordleMatch = firstLine.match(/Wordle\s+([\d,]+)/i);
    // Match guesses: "5/6" or "5/6*" -> "5/6"
    const guessesMatch = firstLine.match(/(\d+)\/(\d+)\*?/);

    if (!wordleMatch || !guessesMatch) {
      return null;
    }

    // Remove commas from wordle number before parsing: "1,667" -> "1667"
    const wordleNumberStr = wordleMatch[1].replace(/,/g, '');
    const wordleNumber = parseInt(wordleNumberStr, 10);
    const guesses = parseInt(guessesMatch[1], 10);
    const maxGuesses = parseInt(guessesMatch[2], 10);

    if (isNaN(wordleNumber) || isNaN(guesses) || guesses < 1 || guesses > maxGuesses) {
      return null;
    }

    // Win/loss logic: Only a loss if it's X/6 (guesses = maxGuesses)
    // Otherwise (1/6, 2/6, 3/6, 4/6, 5/6), it's a win
    const won = guesses < maxGuesses;

    return {
      wordleNumber,
      guesses,
      won,
    };
  } catch (error) {
    console.error("Error parsing Wordle grid:", error);
    return null;
  }
}
