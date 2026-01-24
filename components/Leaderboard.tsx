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

type SortMode = "winRate" | "averageGuesses";

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("winRate");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/leaderboard");
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

  // Sort users based on current sort mode.
  const sortedUsers = [...users].sort((a, b) => {
    if (sortMode === "winRate") {
      // Sort by win rate (descending), then by total games (descending).
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      return b.totalGames - a.totalGames;
    } else {
      // Sort by average guesses (ascending, lower is better).
      // Users with no wins (averageGuesses = null) go to the bottom.
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
    }
  });

  if (loading) {
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

  if (users.length === 0) {
    return (
      <div style={{
        borderRadius: '12px',
        background: 'var(--mist)',
        border: '1px solid var(--border)',
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--slate-400)',
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
        borderBottom: '2px solid var(--border)',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setSortMode("winRate")}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            background: sortMode === "winRate" ? 'var(--blue-soft)' : 'transparent',
            color: sortMode === "winRate" ? 'white' : 'var(--slate-500)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (sortMode !== "winRate") {
              e.currentTarget.style.background = 'var(--mist)';
            }
          }}
          onMouseLeave={(e) => {
            if (sortMode !== "winRate") {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          Win Rate
        </button>
        <button
          onClick={() => setSortMode("averageGuesses")}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            background: sortMode === "averageGuesses" ? 'var(--blue-soft)' : 'transparent',
            color: sortMode === "averageGuesses" ? 'white' : 'var(--slate-500)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (sortMode !== "averageGuesses") {
              e.currentTarget.style.background = 'var(--mist)';
            }
          }}
          onMouseLeave={(e) => {
            if (sortMode !== "averageGuesses") {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          Average Guesses
        </button>
      </div>

      {/* Leaderboard table */}
      <div style={{
        borderRadius: '12px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        overflow: 'hidden',
        boxShadow: '0 1px 3px var(--shadow)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 120px 120px',
          gap: '1rem',
          padding: '1rem 1.5rem',
          background: 'var(--mist)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.8125rem',
          fontWeight: '600',
          color: 'var(--slate-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div>Rank</div>
          <div>Player</div>
          <div style={{ textAlign: 'right' }}>
            {sortMode === "winRate" ? "Win Rate" : "Avg Guesses"}
          </div>
          <div style={{ textAlign: 'right' }}>Games</div>
        </div>

        {sortedUsers.map((user, index) => (
          <div
            key={user.userId}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 120px 120px',
              gap: '1rem',
              padding: '1rem 1.5rem',
              borderBottom: index < sortedUsers.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--mist)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Rank */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: index === 0 ? 'var(--blue-soft)' : 'var(--slate-600)'
            }}>
              {index === 0 && <span style={{ marginRight: '0.25rem' }}>🏆</span>}
              {index + 1}
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

            {/* Primary stat (win rate or avg guesses) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--slate-700)'
              }}>
                {sortMode === "winRate"
                  ? `${user.winRate.toFixed(1)}%`
                  : user.averageGuesses !== null
                  ? user.averageGuesses.toFixed(2)
                  : "N/A"}
              </span>
              {sortMode === "winRate" && (
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--slate-400)'
                }}>
                  {user.wins}W / {user.losses}L
                </span>
              )}
              {sortMode === "averageGuesses" && user.averageGuesses !== null && (
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--slate-400)'
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
              fontSize: '1rem',
              fontWeight: '500',
              color: 'var(--slate-600)'
            }}>
              {user.totalGames}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
