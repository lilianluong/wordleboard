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
          borderBottom: '2px solid var(--border)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
        }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <Link
                href="/"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: 'var(--navy)',
                  textDecoration: 'none',
                  letterSpacing: '-0.02em'
                }}
              >
                Wordle Board
              </Link>
              <div className="flex items-center gap-1 sm:gap-3">
                <Link
                  href="/submit"
                  className="text-sm sm:text-[0.9375rem] px-2.5 sm:px-5"
                  style={{
                    background: 'var(--purple)',
                    color: 'white',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.25)';
                  }}
                >
                  Submit
                </Link>
                <Link
                  href="/stats"
                  className="text-sm sm:text-[0.9375rem] px-2 sm:px-4"
                  style={{
                    color: 'var(--charcoal)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    padding: '0.625rem 0.75rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--purple)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--charcoal)'}
                >
                  Stats
                </Link>
                <Link
                  href="/profile"
                  className="text-sm sm:text-[0.9375rem] px-2 sm:px-4"
                  style={{
                    color: 'var(--charcoal)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    padding: '0.625rem 0.75rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--purple)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--charcoal)'}
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
            padding: '2.5rem',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            border: '2px solid var(--border)'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '2rem',
              fontWeight: '800'
            }}>
              Submit Wordle Result
            </h1>

            <WordleGridParser onParse={setParsed} onInputChange={setGridInput} />

            {message && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1.125rem',
                  borderRadius: '10px',
                  background: message.type === "success" ? 'var(--wordle-green)' : 'var(--error)',
                  color: 'white',
                  fontWeight: '600',
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
                  background: (!parsed || loading) ? 'var(--charcoal)' : 'var(--purple)',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1.0625rem',
                  fontWeight: '700',
                  cursor: (!parsed || loading) ? 'not-allowed' : 'pointer',
                  opacity: (!parsed || loading) ? 0.4 : 1,
                  boxShadow: (!parsed || loading) ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                  border: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!(!parsed || loading)) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!parsed || loading)) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
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
