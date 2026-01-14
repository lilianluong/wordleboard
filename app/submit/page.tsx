"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import WordleGridParser from "@/components/WordleGridParser";
import type { ParsedWordle } from "@/lib/wordle-parser";

export const dynamic = "force-dynamic";

export default function SubmitPage() {
  const [parsed, setParsed] = useState<ParsedWordle | null>(null);
  const [gridInput, setGridInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!parsed) {
      setMessage({ type: "error", text: "Please paste a valid Wordle grid first" });
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

      // Clear the input
      setGridInput("");
      setParsed(null);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/");
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
    <AuthGuard>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <nav style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 3px var(--shadow)'
        }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <Link
                href="/"
                style={{
                  fontSize: '1.375rem',
                  fontWeight: '600',
                  color: 'var(--slate-700)',
                  textDecoration: 'none',
                  letterSpacing: '-0.01em'
                }}
              >
                Wordle Board
              </Link>
              <div className="flex gap-3">
                <Link
                  href="/"
                  style={{
                    color: 'var(--slate-500)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--slate-700)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--slate-500)'}
                >
                  Dashboard
                </Link>
                <Link
                  href="/stats"
                  style={{
                    color: 'var(--slate-500)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--slate-700)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--slate-500)'}
                >
                  Stats
                </Link>
                <Link
                  href="/profile"
                  style={{
                    color: 'var(--slate-500)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--slate-700)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--slate-500)'}
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div style={{
            borderRadius: '12px',
            background: 'var(--surface)',
            padding: '2rem',
            boxShadow: '0 2px 8px var(--shadow)',
            border: '1px solid var(--border)'
          }}>
            <h1 style={{
              fontSize: '2rem',
              marginBottom: '1.5rem'
            }}>
              Submit Wordle Result
            </h1>

            <WordleGridParser onParse={setParsed} onInputChange={setGridInput} />

            {message && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: message.type === "success" ? 'var(--success-light)' : 'var(--error-light)',
                  color: message.type === "success" ? 'var(--success)' : 'var(--error)',
                  fontWeight: '500',
                  fontSize: '0.9375rem'
                }}
              >
                {message.text}
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={handleSubmit}
                disabled={!parsed || loading}
                style={{
                  width: '100%',
                  background: (!parsed || loading) ? 'var(--slate-200)' : 'var(--blue-soft)',
                  color: 'white',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (!parsed || loading) ? 'not-allowed' : 'pointer',
                  opacity: (!parsed || loading) ? 0.6 : 1,
                  boxShadow: (!parsed || loading) ? 'none' : '0 2px 6px rgba(107, 155, 209, 0.25)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!(!parsed || loading)) {
                    e.currentTarget.style.background = 'var(--mint)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 155, 209, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!parsed || loading)) {
                    e.currentTarget.style.background = 'var(--blue-soft)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(107, 155, 209, 0.25)';
                  }
                }}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
