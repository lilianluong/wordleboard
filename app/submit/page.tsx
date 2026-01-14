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
                  fontSize: '1.5rem',
                  fontFamily: 'DM Serif Display, Georgia, serif',
                  color: 'var(--deep-brown)',
                  textDecoration: 'none'
                }}
              >
                Wordle Board
              </Link>
              <div className="flex gap-3">
                <Link
                  href="/"
                  style={{
                    color: 'var(--chocolate)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    padding: '0.625rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--espresso)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--chocolate)'}
                >
                  Dashboard
                </Link>
                <Link
                  href="/stats"
                  style={{
                    color: 'var(--chocolate)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    padding: '0.625rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--espresso)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--chocolate)'}
                >
                  Stats
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div style={{
            borderRadius: '20px',
            background: 'var(--surface)',
            padding: '2.5rem',
            boxShadow: '0 4px 16px var(--shadow)',
            border: '1px solid var(--border)'
          }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontFamily: 'DM Serif Display, Georgia, serif',
              color: 'var(--deep-brown)',
              marginBottom: '2rem'
            }}>
              Submit Wordle Result
            </h1>

            <WordleGridParser onParse={setParsed} onInputChange={setGridInput} />

            {message && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: message.type === "success" ? 'var(--success-light)' : 'var(--error-light)',
                  color: message.type === "success" ? 'var(--success)' : 'var(--error)',
                  fontWeight: '500',
                  fontSize: '0.9375rem'
                }}
              >
                {message.text}
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={handleSubmit}
                disabled={!parsed || loading}
                style={{
                  width: '100%',
                  background: (!parsed || loading) ? 'var(--sand)' : 'var(--honey)',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1.0625rem',
                  fontWeight: '600',
                  cursor: (!parsed || loading) ? 'not-allowed' : 'pointer',
                  opacity: (!parsed || loading) ? 0.6 : 1,
                  boxShadow: (!parsed || loading) ? 'none' : '0 4px 12px rgba(196, 144, 96, 0.3)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!(!parsed || loading)) {
                    e.currentTarget.style.background = 'var(--amber)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(196, 144, 96, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!parsed || loading)) {
                    e.currentTarget.style.background = 'var(--honey)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 144, 96, 0.3)';
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
