"use client";

import { useEffect, useState, useCallback } from "react";
import { getTodayWordleNumber } from "@/lib/wordle-date";

interface Submission {
  id: string;
  user_id: string;
  wordle_number: number;
  guesses: number;
  won: boolean;
  submitted_at: string;
  user?: {
    email: string;
  };
}

interface DailyStatsProps {
  wordleNumber?: number;
}

export default function DailyStats({ wordleNumber }: DailyStatsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [availableWordles, setAvailableWordles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetWordle, setTargetWordle] = useState<number | null>(
    wordleNumber || null
  );

  const fetchSubmissions = useCallback(async () => {
    if (targetWordle === null) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/submissions?wordle_number=${targetWordle}`
      );
      const data = await response.json();

      if (response.ok) {
        // Group by user_id to get latest submission per user for the wordle
        const userMap = new Map<string, Submission>();
        (data.submissions || []).forEach((sub: Submission) => {
          if (!userMap.has(sub.user_id)) {
            userMap.set(sub.user_id, sub);
          }
        });
        setSubmissions(Array.from(userMap.values()));
      } else {
        console.error("Error fetching submissions:", data.error);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }

    setLoading(false);
  }, [targetWordle]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch("/api/submissions");
        const data = await response.json();

        if (response.ok && data.submissions) {
          // Get unique wordle numbers and sort descending (newest first)
          const uniqueWordles = Array.from<number>(
            new Set(data.submissions.map((s: Submission) => s.wordle_number))
          ).sort((a, b) => b - a);
          
          setAvailableWordles(uniqueWordles);

          // Auto-select today's wordle or the latest available if not already set
          if (!targetWordle && !wordleNumber) {
            const todayWordle = getTodayWordleNumber();
            const latestWordle = uniqueWordles[0] || todayWordle;
            // Use today's wordle if available, otherwise use the latest
            const wordleToSelect = uniqueWordles.includes(todayWordle)
              ? todayWordle
              : latestWordle;
            setTargetWordle(wordleToSelect);
          }
        }
      } catch (error) {
        console.error("Error fetching available wordles:", error);
      }
    };

    loadInitialData();
  }, [targetWordle, wordleNumber]);

  useEffect(() => {
    if (targetWordle !== null) {
      fetchSubmissions();
    }
  }, [targetWordle, fetchSubmissions]);

  if (loading && submissions.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--chocolate)',
        fontSize: '1.0625rem'
      }}>
        Loading...
      </div>
    );
  }

  const currentWordle = targetWordle || submissions[0]?.wordle_number;
  const userSubmissions = submissions; // Already grouped in fetchSubmissions

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontFamily: 'DM Serif Display, Georgia, serif',
          color: 'var(--deep-brown)'
        }}>
          Wordle #{currentWordle || "N/A"}
        </h2>
        <select
          value={targetWordle || ""}
          onChange={(e) =>
            setTargetWordle(e.target.value ? parseInt(e.target.value) : null)
          }
          style={{
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            padding: '0.625rem 2.5rem 0.625rem 1rem',
            fontSize: '0.9375rem',
            color: 'var(--espresso)',
            fontWeight: '500',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238b6f47' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center'
          }}
        >
          {availableWordles.map((wordleNum) => (
            <option key={wordleNum} value={wordleNum}>
              Wordle #{wordleNum}
            </option>
          ))}
        </select>
      </div>

      {userSubmissions.length === 0 ? (
        <div style={{
          borderRadius: '16px',
          background: 'var(--warm-white)',
          border: '1px solid var(--border)',
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--chocolate)',
          fontSize: '1.0625rem'
        }}>
          No submissions yet for this Wordle
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1.25rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
        }}>
          {userSubmissions.map((submission) => (
            <div
              key={submission.id}
              style={{
                borderRadius: '16px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                padding: '1.5rem',
                boxShadow: '0 2px 8px var(--shadow)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(93, 74, 58, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{
                    fontWeight: '600',
                    color: 'var(--espresso)',
                    fontSize: '1.0625rem',
                    marginBottom: '0.375rem'
                  }}>
                    {submission.user?.email || submission.user_id.substring(0, 8) + "..."}
                  </p>
                  <p style={{
                    fontSize: '1.5rem',
                    fontFamily: 'DM Serif Display, Georgia, serif',
                    color: 'var(--honey)',
                    fontWeight: '400'
                  }}>
                    {submission.guesses}/6
                  </p>
                </div>
                <div
                  style={{
                    borderRadius: '20px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: submission.won ? 'var(--success-light)' : 'var(--error-light)',
                    color: submission.won ? 'var(--success)' : 'var(--error)'
                  }}
                >
                  {submission.won ? "Won" : "Lost"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
