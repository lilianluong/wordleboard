"use client";

import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const [targetWordle, setTargetWordle] = useState<number | null>(
    wordleNumber || null
  );

  useEffect(() => {
    fetchSubmissions();
  }, [targetWordle]);

  const fetchSubmissions = async () => {
    setLoading(true);

    try {
      // First, get all submissions to find the latest wordle number if not specified
      let wordleToFetch = targetWordle;
      
      if (!wordleToFetch) {
        const allResponse = await fetch("/api/submissions");
        const allData = await allResponse.json();
        if (allData.submissions && allData.submissions.length > 0) {
          // Get the highest wordle number
          wordleToFetch = Math.max(
            ...allData.submissions.map((s: Submission) => s.wordle_number)
          );
        }
      }

      const url = wordleToFetch
        ? `/api/submissions?wordle_number=${wordleToFetch}`
        : "/api/submissions";
      const response = await fetch(url);
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
  };

  if (loading) {
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
        <input
          type="number"
          placeholder="Wordle #"
          value={targetWordle || ""}
          onChange={(e) =>
            setTargetWordle(e.target.value ? parseInt(e.target.value) : null)
          }
          className="rounded-md border border-gray-300 px-3 py-1 text-sm"
        />
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
                    {submission.user_id.substring(0, 8)}...
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
