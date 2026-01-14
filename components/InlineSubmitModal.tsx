"use client";

import { useState } from "react";
import WordleGridParser from "@/components/WordleGridParser";
import type { ParsedWordle } from "@/lib/wordle-parser";

interface InlineSubmitModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function InlineSubmitModal({
  onClose,
  onSuccess,
}: InlineSubmitModalProps) {
  const [parsed, setParsed] = useState<ParsedWordle | null>(null);
  const [gridInput, setGridInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!parsed) {
      setMessage({
        type: "error",
        text: "Please paste a valid Wordle grid first",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (!gridInput) {
        throw new Error("Grid input is empty");
      }

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grid: gridInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      setMessage({
        type: "success",
        text: data.updated
          ? "Submission updated successfully!"
          : "Submission created successfully!",
      });

      // Wait a moment before closing and refreshing.
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to submit",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal backdrop. */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "1rem",
        }}
      >
        {/* Modal content. */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--surface)",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "600px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            border: "1px solid var(--border)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.625rem", fontWeight: "600" }}>
              Submit Wordle Result
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                color: "var(--slate-500)",
                cursor: "pointer",
                padding: "0.25rem",
                lineHeight: "1",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--slate-700)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--slate-500)")
              }
            >
              ×
            </button>
          </div>

          <WordleGridParser onParse={setParsed} onInputChange={setGridInput} />

          {message && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                borderRadius: "8px",
                background:
                  message.type === "success"
                    ? "var(--success-light)"
                    : "var(--error-light)",
                color:
                  message.type === "success"
                    ? "var(--success)"
                    : "var(--error)",
                fontWeight: "500",
                fontSize: "0.9375rem",
              }}
            >
              {message.text}
            </div>
          )}

          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "0.75rem",
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={!parsed || loading}
              style={{
                flex: 1,
                background:
                  !parsed || loading ? "var(--slate-200)" : "var(--blue-soft)",
                color: "white",
                padding: "0.875rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: !parsed || loading ? "not-allowed" : "pointer",
                opacity: !parsed || loading ? 0.6 : 1,
                boxShadow:
                  !parsed || loading
                    ? "none"
                    : "0 2px 6px rgba(107, 155, 209, 0.25)",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (!(!parsed || loading)) {
                  e.currentTarget.style.background = "var(--mint)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(107, 155, 209, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!(!parsed || loading)) {
                  e.currentTarget.style.background = "var(--blue-soft)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(107, 155, 209, 0.25)";
                }
              }}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "0.875rem 1.5rem",
                fontSize: "1rem",
                fontWeight: "600",
                background: "transparent",
                color: "var(--slate-500)",
                border: "1.5px solid var(--border)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--mist)";
                e.currentTarget.style.color = "var(--slate-700)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--slate-500)";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
