"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/components/UserAvatar";

interface LeaderboardUser {
  userId: string;
  username: string;
  email: string | null;
  profilePictureUrl: string | null;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageGuesses: number | null;
}

type TimePeriod = "week" | "month" | "all";

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>("all");

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/leaderboard?period=${period}`);
      const data = await response.json();

      if (response.ok && data.leaderboard) {
        setUsers(data.leaderboard);
      } else {
        console.error("Error fetching leaderboard:", data.error);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }

    setLoading(false);
  };

  // Sort users by average guesses (ascending, lower is better).
  // Users with no wins (averageGuesses = null) go to the bottom.
  const sortedUsers = [...users].sort((a, b) => {
    if (a.averageGuesses === null && b.averageGuesses === null) {
      return 0;
    }
    if (a.averageGuesses === null) {
      return 1;
    }
    if (b.averageGuesses === null) {
      return -1;
    }
    // Lower average is better, then more games as tiebreaker.
    if (a.averageGuesses !== b.averageGuesses) {
      return a.averageGuesses - b.averageGuesses;
    }
    return b.totalGames - a.totalGames;
  });

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--charcoal)',
        fontSize: '1rem'
      }}>
        Loading...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{
        borderRadius: '12px',
        background: 'var(--paper)',
        border: '1px solid var(--border)',
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--charcoal)',
        fontSize: '1rem'
      }}>
        No users found
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tab buttons */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '3px solid var(--border)',
        paddingBottom: '0',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setPeriod("week")}
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            background: 'transparent',
            color: period === "week" ? 'var(--purple)' : 'var(--charcoal)',
            border: 'none',
            borderRadius: '0',
            borderBottom: period === "week" ? '3px solid var(--purple)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'color 0.2s ease, border-color 0.2s ease',
            marginBottom: '-3px',
            whiteSpace: 'nowrap'
          }}
        >
          Last Week
        </button>
        <button
          onClick={() => setPeriod("month")}
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            background: 'transparent',
            color: period === "month" ? 'var(--purple)' : 'var(--charcoal)',
            border: 'none',
            borderRadius: '0',
            borderBottom: period === "month" ? '3px solid var(--purple)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'color 0.2s ease, border-color 0.2s ease',
            marginBottom: '-3px',
            whiteSpace: 'nowrap'
          }}
        >
          Last Month
        </button>
        <button
          onClick={() => setPeriod("all")}
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            background: 'transparent',
            color: period === "all" ? 'var(--purple)' : 'var(--charcoal)',
            border: 'none',
            borderRadius: '0',
            borderBottom: period === "all" ? '3px solid var(--purple)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'color 0.2s ease, border-color 0.2s ease',
            marginBottom: '-3px',
            whiteSpace: 'nowrap'
          }}
        >
          All Time
        </button>
      </div>

      {/* Leaderboard table */}
      <div style={{
        borderRadius: '12px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        overflow: 'auto',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px minmax(140px, 1fr) 120px 100px',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: 'var(--paper)',
          borderBottom: '2px solid var(--border)',
          fontSize: '0.8125rem',
          fontWeight: '600',
          color: 'var(--charcoal)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          minWidth: '520px'
        }}>
          <div>Rank</div>
          <div>Player</div>
          <div style={{ textAlign: 'right' }}>Avg Guesses</div>
          <div style={{ textAlign: 'right' }}>Games</div>
        </div>

        {sortedUsers.map((user, index) => (
          <div
            key={user.userId}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px minmax(140px, 1fr) 120px 100px',
              gap: '0.75rem',
              padding: '1.25rem 1.25rem',
              borderBottom: index < sortedUsers.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
              cursor: 'pointer',
              minWidth: '520px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
              e.currentTarget.style.background = 'var(--paper)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Rank */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {index === 0 ? (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  boxShadow: '0 8px 24px rgba(251, 191, 36, 0.4)',
                  border: '3px solid white'
                }}>
                  🏆
                </div>
              ) : index === 1 || index === 2 ? (
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: 'white',
                  boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)',
                  border: '3px solid white'
                }}>
                  {index + 1}
                </div>
              ) : (
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: 'var(--charcoal)'
                }}>
                  {index + 1}
                </div>
              )}
            </div>

            {/* Player */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <UserAvatar
                username={user.username}
                avatarUrl={user.profilePictureUrl}
                size="sm"
              />
            </div>

            {/* Average guesses stat */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '3rem',
                fontWeight: '900',
                color: 'var(--navy)',
                lineHeight: '1'
              }}>
                {user.averageGuesses !== null
                  ? user.averageGuesses.toFixed(2)
                  : "N/A"}
              </span>
              {user.averageGuesses !== null && (
                <span style={{
                  fontSize: '0.8125rem',
                  color: 'var(--charcoal)',
                  fontWeight: '500',
                  marginTop: '0.25rem'
                }}>
                  {user.wins} wins
                </span>
              )}
            </div>

            {/* Total games */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--navy)'
            }}>
              {user.totalGames}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
