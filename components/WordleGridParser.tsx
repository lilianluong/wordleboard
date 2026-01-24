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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label
          htmlFor="wordle-grid"
          style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '700',
            color: 'var(--navy)',
            marginBottom: '0.5rem'
          }}
        >
          Paste your Wordle result
        </label>
        <textarea
          id="wordle-grid"
          value={input}
          onChange={handleInputChange}
          placeholder="Wordle 1234 3/6&#10;&#10;⬛🟨⬛⬛⬛&#10;🟨🟩⬛⬛⬛&#10;🟩🟩🟩🟩🟩"
          style={{
            width: '100%',
            border: '2px solid var(--border)',
            background: 'var(--paper)',
            padding: '0.875rem',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.9375rem',
            color: 'var(--navy)',
            lineHeight: '1.5',
            fontWeight: '500'
          }}
          rows={8}
        />
      </div>

      {parsed && (
        <div style={{
          borderRadius: '10px',
          background: 'rgba(106, 170, 100, 0.1)',
          padding: '1.125rem',
          border: '2px solid var(--wordle-green)'
        }}>
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: '700',
            color: 'var(--wordle-green)',
            marginBottom: '0.75rem'
          }}>
            Parsed successfully!
          </h3>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--navy)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            fontWeight: '600'
          }}>
            <p>Wordle #{parsed.wordleNumber}</p>
            <p>Guesses: {parsed.guesses}/6</p>
            <p>Status: {parsed.won ? "✅ Won" : "❌ Lost"}</p>
          </div>
        </div>
      )}

      {input && !parsed && (
        <div style={{
          borderRadius: '10px',
          background: 'var(--error-light)',
          padding: '1.125rem',
          border: '2px solid var(--error)'
        }}>
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--error)',
            fontWeight: '600'
          }}>
            Could not parse the Wordle grid. Please check the format.
          </p>
        </div>
      )}
    </div>
  );
}
