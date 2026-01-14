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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label
          htmlFor="wordle-grid"
          style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: 'var(--espresso)',
            marginBottom: '0.625rem'
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
            border: '1.5px solid var(--border)',
            background: 'var(--cream)',
            padding: '1rem',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.9375rem',
            color: 'var(--espresso)',
            lineHeight: '1.5'
          }}
          rows={8}
        />
      </div>

      {parsed && (
        <div style={{
          borderRadius: '14px',
          background: 'var(--success-light)',
          padding: '1.25rem',
          border: '1px solid var(--success)'
        }}>
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: 'var(--success)',
            marginBottom: '0.75rem'
          }}>
            Parsed successfully!
          </h3>
          <div style={{
            fontSize: '0.9375rem',
            color: 'var(--success)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            fontWeight: '500'
          }}>
            <p>Wordle #{parsed.wordleNumber}</p>
            <p>Guesses: {parsed.guesses}/6</p>
            <p>Status: {parsed.won ? "✅ Won" : "❌ Lost"}</p>
          </div>
        </div>
      )}

      {input && !parsed && (
        <div style={{
          borderRadius: '14px',
          background: 'var(--error-light)',
          padding: '1.25rem',
          border: '1px solid var(--error)'
        }}>
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--error)',
            fontWeight: '500'
          }}>
            Could not parse the Wordle grid. Please check the format.
          </p>
        </div>
      )}
    </div>
  );
}
