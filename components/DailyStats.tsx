"use client";

import { useEffect, useState, useCallback } from "react";
import { getTodayWordleNumber } from "@/lib/wordle-date";
import UserAvatar from "@/components/UserAvatar";
import { createClient } from "@/lib/supabase/client";
import InlineSubmitModal from "@/components/InlineSubmitModal";

interface Submission {
  id: string;
  user_id: string;
  wordle_number: number;
  guesses: number;
  won: boolean;
  guesses_grid?: string;
  submitted_at: string;
  user?: {
    email: string;
    username: string | null;
    profile_picture_url: string | null;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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

  // Get current user.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchCurrentUser();
  }, []);

  // Check if user has submitted today's wordle.
  useEffect(() => {
    const checkTodaySubmission = async () => {
      if (!currentUserId) return;

      const todayWordle = getTodayWordleNumber();
      try {
        const response = await fetch(
          `/api/submissions?wordle_number=${todayWordle}`
        );
        const data = await response.json();

        if (response.ok && data.submissions) {
          const userSubmission = data.submissions.find(
            (s: Submission) => s.user_id === currentUserId
          );
          setHasSubmittedToday(!!userSubmission);
        }
      } catch (error) {
        console.error("Error checking today's submission:", error);
      }
    };

    checkTodaySubmission();
  }, [currentUserId, targetWordle]);

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
        color: 'var(--slate-400)',
        fontSize: '1rem'
      }}>
        Loading...
      </div>
    );
  }

  const currentWordle = targetWordle || submissions[0]?.wordle_number;
  // Sort submissions: wins first (by fewest guesses, then oldest), losses last.
  const userSubmissions = submissions.sort((a, b) => {
    // Losses always go to the bottom.
    if (a.won !== b.won) {
      return a.won ? -1 : 1;
    }

    // Both won or both lost - sort by guesses (fewest first).
    if (a.guesses !== b.guesses) {
      return a.guesses - b.guesses;
    }

    // Same guesses - sort by oldest submission first.
    return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
  });

  const todayWordle = getTodayWordleNumber();
  const isViewingToday = currentWordle === todayWordle;
  const shouldShowCTA = isViewingToday && !hasSubmittedToday && currentUserId;

  const handleSubmitSuccess = () => {
    // Refresh the submissions after successful submit.
    setHasSubmittedToday(true);
    fetchSubmissions();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ fontSize: '1.625rem' }}>
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
            padding: '0.5rem 2.5rem 0.5rem 0.875rem',
            fontSize: '0.9375rem',
            color: 'var(--slate-600)',
            fontWeight: '500',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%235f738c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
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

      {shouldShowCTA && (
        <div style={{
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--blue-soft) 0%, var(--mint) 100%)',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(107, 155, 209, 0.3)',
          border: '1px solid rgba(107, 155, 209, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              Haven't submitted today's Wordle yet?
            </h3>
            <p style={{
              fontSize: '0.9375rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '400'
            }}>
              Submit your result for Wordle #{todayWordle} now!
            </p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              background: 'white',
              color: 'var(--blue-soft)',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            }}
          >
            Submit Today's Wordle
          </button>
        </div>
      )}

      {userSubmissions.length === 0 ? (
        <div style={{
          borderRadius: '12px',
          background: 'var(--mist)',
          border: '1px solid var(--border)',
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--slate-400)',
          fontSize: '1rem'
        }}>
          No submissions yet for this Wordle
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
        }}>
          {userSubmissions.map((submission) => (
            <div
              key={submission.id}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                padding: '1.25rem',
                boxShadow: '0 1px 3px var(--shadow)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 55, 72, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px var(--shadow)';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ flex: '1', minWidth: '0' }}>
                    <div style={{ marginBottom: '0.25rem' }}>
                      <UserAvatar
                        username={submission.user?.username || submission.user?.email || "Anonymous"}
                        avatarUrl={submission.user?.profile_picture_url}
                        size="sm"
                      />
                    </div>
                    <p style={{
                      fontSize: '1.625rem',
                      fontWeight: '600',
                      color: 'var(--blue-soft)',
                      lineHeight: '1'
                    }}>
                      {submission.guesses}/6
                    </p>
                  </div>
                  <div
                    style={{
                      borderRadius: '8px',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      background: submission.won ? 'var(--success-light)' : 'var(--error-light)',
                      color: submission.won ? 'var(--success)' : 'var(--error)',
                      flexShrink: '0'
                    }}
                  >
                    {submission.won ? "Won" : "Lost"}
                  </div>
                </div>
                {submission.guesses_grid && (
                  <div style={{
                    background: 'var(--mist)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    whiteSpace: 'pre',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '1.25rem',
                    lineHeight: '1.4',
                    letterSpacing: '0.05em'
                  }}>
                    {submission.guesses_grid}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSubmitModal && (
        <InlineSubmitModal
          onClose={() => setShowSubmitModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
