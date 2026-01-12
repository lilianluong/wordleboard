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
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="user-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select User
        </label>
        <select
          id="user-select"
          value={selectedUserId || ""}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
          No submissions found for this user
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Games</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalGames}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Win Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.winRate}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.wins}W / {stats.losses}L
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Avg Guesses</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.averageGuesses}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Best / Worst</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.bestGuesses !== null ? `${stats.bestGuesses} / ${stats.worstGuesses}` : "N/A"}
            </p>
          </div>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Recent Games</h3>
          <div className="space-y-2">
            {submissions.slice(0, 10).map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
              >
                <span className="text-sm text-gray-600">
                  Wordle #{sub.wordle_number}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{sub.guesses}/6</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      sub.won
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
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
