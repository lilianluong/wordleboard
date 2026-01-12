import { createClient } from "@/lib/supabase/server";
import { parseWordleGrid } from "@/lib/wordle-parser";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { grid } = body;

    if (!grid || typeof grid !== "string") {
      return NextResponse.json(
        { error: "Wordle grid is required" },
        { status: 400 }
      );
    }

    const parsed = parseWordleGrid(grid);

    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid Wordle grid format" },
        { status: 400 }
      );
    }

    // Check for duplicate submission (same user, same wordle number)
    const { data: existing } = await supabase
      .from("wordle_submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("wordle_number", parsed.wordleNumber)
      .single();

    // Upsert user profile with email
    if (user.email) {
      await supabase.from("user_profiles").upsert({
        user_id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
      });
    }

    if (existing) {
      // Update existing submission
      const { error } = await supabase
        .from("wordle_submissions")
        .update({
          guesses: parsed.guesses,
          won: parsed.won,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating submission:", error);
        return NextResponse.json(
          { error: "Failed to update submission" },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "Submission updated", updated: true });
    }

    // Create new submission
    const { error } = await supabase.from("wordle_submissions").insert({
      user_id: user.id,
      wordle_number: parsed.wordleNumber,
      guesses: parsed.guesses,
      won: parsed.won,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error creating submission:", error);
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Submission created", updated: false });
  } catch (error) {
    console.error("Error in submissions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const wordleNumber = searchParams.get("wordle_number");
    const userId = searchParams.get("user_id");

    let query = supabase
      .from("wordle_submissions")
      .select(`
        *,
        user_profiles(email)
      `)
      .order("submitted_at", { ascending: false });

    if (wordleNumber) {
      query = query.eq("wordle_number", parseInt(wordleNumber, 10));
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching submissions:", error);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    // Transform the data to include user email in a consistent format
    const submissionsWithUser = (data || []).map((submission: any) => {
      // user_profiles is an array from the join, get the first item
      const profile = Array.isArray(submission.user_profiles) 
        ? submission.user_profiles[0] 
        : submission.user_profiles;
      
      return {
        ...submission,
        user: {
          email: profile?.email || (submission.user_id === user.id ? user.email : null) || null,
        },
      };
    });

    return NextResponse.json({ submissions: submissionsWithUser });
  } catch (error) {
    console.error("Error in submissions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
