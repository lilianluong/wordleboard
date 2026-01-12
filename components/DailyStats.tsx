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
    return <div className="text-center py-8">Loading...</div>;
  }

  const currentWordle = targetWordle || submissions[0]?.wordle_number;
  const userSubmissions = submissions; // Already grouped in fetchSubmissions

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Wordle #{currentWordle || "N/A"}
        </h2>
        <select
          value={targetWordle || ""}
          onChange={(e) =>
            setTargetWordle(e.target.value ? parseInt(e.target.value) : null)
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          {availableWordles.map((wordleNum) => (
            <option key={wordleNum} value={wordleNum}>
              Wordle #{wordleNum}
            </option>
          ))}
        </select>
      </div>

      {userSubmissions.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
          No submissions yet for this Wordle
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {submission.user?.email || submission.user_id.substring(0, 8) + "..."}
                  </p>
                  <p className="text-sm text-gray-500">
                    {submission.guesses}/6
                  </p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    submission.won
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
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
