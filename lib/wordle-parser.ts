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

    // Parse first line: "Wordle 1234 3/6"
    const firstLine = lines[0];
    const wordleMatch = firstLine.match(/Wordle\s+(\d+)/i);
    const guessesMatch = firstLine.match(/(\d+)\/(\d+)/);

    if (!wordleMatch || !guessesMatch) {
      return null;
    }

    const wordleNumber = parseInt(wordleMatch[1], 10);
    const guesses = parseInt(guessesMatch[1], 10);
    const maxGuesses = parseInt(guessesMatch[2], 10);

    if (isNaN(wordleNumber) || isNaN(guesses) || guesses < 1 || guesses > maxGuesses) {
      return null;
    }

    // Check if won by looking at the last row of emojis
    // If the last row has all green squares (🟩), the user won
    const emojiLines = lines.slice(1);
    if (emojiLines.length === 0) {
      return null;
    }

    const lastRow = emojiLines[emojiLines.length - 1];
    // Check if last row is all green squares
    const allGreen = /^🟩+$/.test(lastRow.trim());
    
    // Also check if guesses match the number of rows
    const actualRows = emojiLines.length;
    const won = allGreen && actualRows === guesses;

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
