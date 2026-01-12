"use client";

import { useState } from "react";
import { parseWordleGrid, type ParsedWordle } from "@/lib/wordle-parser";

interface WordleGridParserProps {
  onParse: (parsed: ParsedWordle | null) => void;
  onInputChange?: (value: string) => void;
}

export default function WordleGridParser({ onParse, onInputChange }: WordleGridParserProps) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedWordle | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    onInputChange?.(value);

    const result = parseWordleGrid(value);
    setParsed(result);
    onParse(result);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="wordle-grid"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Paste your Wordle result
        </label>
        <textarea
          id="wordle-grid"
          value={input}
          onChange={handleInputChange}
          placeholder="Wordle 1234 3/6&#10;&#10;⬛🟨⬛⬛⬛&#10;🟨🟩⬛⬛⬛&#10;🟩🟩🟩🟩🟩"
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          rows={8}
        />
      </div>

      {parsed && (
        <div className="rounded-md bg-green-50 p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">
            Parsed successfully!
          </h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>Wordle #{parsed.wordleNumber}</p>
            <p>Guesses: {parsed.guesses}/6</p>
            <p>Status: {parsed.won ? "✅ Won" : "❌ Lost"}</p>
          </div>
        </div>
      )}

      {input && !parsed && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Could not parse the Wordle grid. Please check the format.
          </p>
        </div>
      )}
    </div>
  );
}
