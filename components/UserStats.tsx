"use client";

import { useEffect, useState } from "react";

interface Submission {
  wordle_number: number;
  guesses: number;
  won: boolean;
}

interface User {
  id: string;
  email: string;
  username: string | null;
}

interface UserStatsProps {
  userId?: string;
}

export default function UserStats({ userId }: UserStatsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserSubmissions(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/submissions");
      const data = await response.json();

      if (response.ok && data.submissions) {
        const userIds = data.submissions.map((s: any) => s.user_id as string);
        const uniqueUserIds: string[] = Array.from(new Set(userIds));
        setUsers(
          uniqueUserIds.map((id: string) => {
            const submission = data.submissions.find((s: any) => s.user_id === id);
            return {
              id,
              email: submission?.user?.email || id.substring(0, 8) + "...",
              username: submission?.user?.username || null,
            };
          })
        );

        if (uniqueUserIds.length > 0 && !selectedUserId) {
          setSelectedUserId(uniqueUserIds[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserSubmissions = async (uid: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/submissions?user_id=${uid}`);
      const data = await response.json();

      if (response.ok) {
        setSubmissions(
          (data.submissions || []).map((s: any) => ({
            wordle_number: s.wordle_number,
            guesses: s.guesses,
            won: s.won,
          }))
        );
      } else {
        console.error("Error fetching user submissions:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user submissions:", error);
    }

    setLoading(false);
  };

  const stats = {
    totalGames: submissions.length,
    wins: submissions.filter((s) => s.won).length,
    losses: submissions.filter((s) => !s.won).length,
    winRate: submissions.length > 0
      ? ((submissions.filter((s) => s.won).length / submissions.length) * 100).toFixed(1)
      : "0",
    averageGuesses: submissions.length > 0
      ? (
          submissions.reduce((sum, s) => sum + s.guesses, 0) / submissions.length
        ).toFixed(2)
      : "0",
    bestGuesses: submissions.length > 0
      ? Math.min(...submissions.map((s) => s.guesses))
      : null,
    worstGuesses: submissions.length > 0
      ? Math.max(...submissions.map((s) => s.guesses))
      : null,
  };

  if (loading && !submissions.length) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <label
          htmlFor="user-select"
          style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: 'var(--slate-700)',
            marginBottom: '0.5rem'
          }}
        >
          Select User
        </label>
        <select
          id="user-select"
          value={selectedUserId || ""}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={{
            width: '100%',
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            padding: '0.75rem 2.5rem 0.75rem 1rem',
            fontSize: '1rem',
            color: 'var(--slate-600)',
            fontWeight: '500',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%235f738c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center'
          }}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username || user.email}
            </option>
          ))}
        </select>
      </div>

      {submissions.length === 0 ? (
        <div style={{
          borderRadius: '12px',
          background: 'var(--mist)',
          border: '1px solid var(--border)',
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--slate-400)',
          fontSize: '1rem'
        }}>
          No submissions found for this user
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
        }}>
          <div style={{
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '1.25rem',
            boxShadow: '0 1px 3px var(--shadow)'
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.5rem', fontWeight: '500' }}>
              Total Games
            </p>
            <p style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: 'var(--slate-700)'
            }}>
              {stats.totalGames}
            </p>
          </div>
          <div style={{
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '1.25rem',
            boxShadow: '0 1px 3px var(--shadow)'
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.5rem', fontWeight: '500' }}>
              Win Rate
            </p>
            <p style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: 'var(--slate-700)'
            }}>
              {stats.winRate}%
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
              {stats.wins}W / {stats.losses}L
            </p>
          </div>
          <div style={{
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '1.25rem',
            boxShadow: '0 1px 3px var(--shadow)'
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.5rem', fontWeight: '500' }}>
              Avg Guesses
            </p>
            <p style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: 'var(--slate-700)'
            }}>
              {stats.averageGuesses}
            </p>
          </div>
          <div style={{
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '1.25rem',
            boxShadow: '0 1px 3px var(--shadow)'
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.5rem', fontWeight: '500' }}>
              Best / Worst
            </p>
            <p style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: 'var(--slate-700)'
            }}>
              {stats.bestGuesses !== null ? `${stats.bestGuesses} / ${stats.worstGuesses}` : "N/A"}
            </p>
          </div>
        </div>
      )}

      {submissions.length > 0 && (
        <div style={{
          borderRadius: '12px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '1.5rem',
          boxShadow: '0 1px 3px var(--shadow)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--slate-700)',
            marginBottom: '1rem'
          }}>
            Recent Games
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {submissions.slice(0, 10).map((sub, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: idx < Math.min(9, submissions.length - 1) ? '1px solid var(--border)' : 'none',
                  paddingBottom: '0.625rem'
                }}
              >
                <span style={{ fontSize: '0.9375rem', color: 'var(--slate-500)' }}>
                  Wordle #{sub.wordle_number}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: 'var(--slate-700)'
                  }}>
                    {sub.guesses}/6
                  </span>
                  <span
                    style={{
                      borderRadius: '8px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: sub.won ? 'var(--success-light)' : 'var(--error-light)',
                      color: sub.won ? 'var(--success)' : 'var(--error)'
                    }}
                  >
                    {sub.won ? "W" : "L"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
