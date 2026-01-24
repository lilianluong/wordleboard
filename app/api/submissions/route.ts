import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseWordleGrid } from "@/lib/wordle-parser";
import { generateUniqueUsername } from "@/lib/username-utils";
import { sendPushNotifications } from "@/lib/push-sender";
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

    // Upsert user profile with email and username.
    if (user.email) {
      // Check if profile exists.
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("user_id, username")
        .eq("user_id", user.id)
        .single();

      if (!existingProfile) {
        // Create new profile with unique username.
        const username = await generateUniqueUsername(supabase, user.email, user.id);

        const { error: profileError } = await supabase.from("user_profiles").insert({
          user_id: user.id,
          email: user.email,
          username: username,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          // Continue anyway - profile creation is not critical
        }
      } else {
        // Update existing profile email only.
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({
            email: user.email,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (profileError) {
          console.error("Error updating user profile:", profileError);
          // Continue anyway - profile update is not critical
        }
      }
    }

    if (existing) {
      // Update existing submission
      const { error } = await supabase
        .from("wordle_submissions")
        .update({
          guesses: parsed.guesses,
          won: parsed.won,
          guesses_grid: parsed.guessesGrid,
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

      // Send push notifications (non-blocking).
      sendNotificationsAsync(supabase, user.id, parsed).catch((err) =>
        console.error("Notification error:", err)
      );

      return NextResponse.json({ message: "Submission updated", updated: true });
    }

    // Create new submission
    const { error } = await supabase.from("wordle_submissions").insert({
      user_id: user.id,
      wordle_number: parsed.wordleNumber,
      guesses: parsed.guesses,
      won: parsed.won,
      guesses_grid: parsed.guessesGrid,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error creating submission:", error);
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 }
      );
    }

    // Send push notifications (non-blocking).
    sendNotificationsAsync(supabase, user.id, parsed).catch((err) =>
      console.error("Notification error:", err)
    );

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
      .select("*")
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
        { error: "Failed to fetch submissions", details: error.message },
        { status: 500 }
      );
    }

    // Fetch user profiles
    let profilesMap = new Map<string, any>();
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, email, username, profile_picture_url");

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      // Continue without profiles - will fall back to user IDs
    } else if (profiles) {
      profiles.forEach((profile: any) => {
        profilesMap.set(profile.user_id, profile);
      });
    }

    // Transform the data to include user email, username, and profile picture in a consistent format
    const submissionsWithUser = (data || []).map((submission: any) => {
      const profile = profilesMap.get(submission.user_id);
      const email = profile?.email || (submission.user_id === user.id ? user.email : null) || null;
      const username = profile?.username || null;
      const profile_picture_url = profile?.profile_picture_url || null;

      return {
        ...submission,
        user: {
          email,
          username,
          profile_picture_url,
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

/**
 * Send push notifications to all users except the submitter.
 * Runs asynchronously and doesn't block the submission response.
 */
async function sendNotificationsAsync(
  supabase: any,
  submitterId: string,
  parsed: any
) {
  try {
    // Setup.
    // Use admin client to bypass RLS when fetching push subscriptions.
    const adminSupabase = createAdminClient();

    // Fetch submitter username.
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("username")
      .eq("user_id", submitterId)
      .single();

    const username = profile?.username || "Someone";

    // Fetch all subscriptions except submitter.
    const { data: subscriptions } = await adminSupabase
      .from("push_subscriptions")
      .select("*")
      .neq("user_id", submitterId);

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    // Act.
    // Build notification payload.
    const scoreText = parsed.won
      ? `${parsed.guesses}/6`
      : "X/6";

    const payload = {
      title: "New Wordle Submission!",
      body: `${username} completed Wordle #${parsed.wordleNumber} in ${scoreText}`,
      url: "/",
    };

    // Send notifications.
    const { expired } = await sendPushNotifications(subscriptions, payload);

    // Assert.
    // Cleanup expired subscriptions.
    if (expired.length > 0) {
      await adminSupabase.from("push_subscriptions").delete().in("id", expired);
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}
