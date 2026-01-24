import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all submissions.
    const { data: submissions, error: submissionsError } = await supabase
      .from("wordle_submissions")
      .select("user_id, guesses, won");

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    // Fetch user profiles.
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, email, username, profile_picture_url");

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch user profiles" },
        { status: 500 }
      );
    }

    // Build profiles map.
    const profilesMap = new Map<string, any>();
    profiles?.forEach((profile) => {
      profilesMap.set(profile.user_id, profile);
    });

    // Aggregate stats by user.
    const userStatsMap = new Map<string, {
      userId: string;
      totalGames: number;
      wins: number;
      losses: number;
      totalGuessesForWins: number;
      winRate: number;
      averageGuesses: number | null;
    }>();

    submissions?.forEach((submission) => {
      const { user_id, guesses, won } = submission;

      if (!userStatsMap.has(user_id)) {
        userStatsMap.set(user_id, {
          userId: user_id,
          totalGames: 0,
          wins: 0,
          losses: 0,
          totalGuessesForWins: 0,
          winRate: 0,
          averageGuesses: null,
        });
      }

      const stats = userStatsMap.get(user_id)!;
      stats.totalGames += 1;

      if (won) {
        stats.wins += 1;
        stats.totalGuessesForWins += guesses;
      } else {
        stats.losses += 1;
      }
    });

    // Calculate derived stats.
    const leaderboardData = Array.from(userStatsMap.values()).map((stats) => {
      const profile = profilesMap.get(stats.userId);

      return {
        userId: stats.userId,
        username: profile?.username || profile?.email || "Anonymous",
        email: profile?.email || null,
        profilePictureUrl: profile?.profile_picture_url || null,
        totalGames: stats.totalGames,
        wins: stats.wins,
        losses: stats.losses,
        winRate: stats.totalGames > 0
          ? (stats.wins / stats.totalGames) * 100
          : 0,
        averageGuesses: stats.wins > 0
          ? stats.totalGuessesForWins / stats.wins
          : null,
      };
    });

    // Filter out users with no games.
    const filteredData = leaderboardData.filter(data => data.totalGames > 0);

    return NextResponse.json({ leaderboard: filteredData });
  } catch (error) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
