import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Check notification subscription status for the current user.
 * Returns whether the user has any active subscriptions.
 */
export async function GET() {
  try {
    // Setup.
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Act.
    // Check if user has any subscriptions.
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    // Assert.
    if (error) {
      console.error("Error checking subscription status:", error);
      return NextResponse.json(
        { error: "Failed to check status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscribed: subscriptions && subscriptions.length > 0,
    });
  } catch (error) {
    console.error("Error in status endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
