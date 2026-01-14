import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/username-utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile.
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("user_id, email, username, profile_picture_url, updated_at")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, profile_picture_url } = body;

    // Validate username if provided.
    if (username !== undefined) {
      const validation = validateUsername(username);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Check if username is already taken by another user.
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("username", username)
        .single();

      if (existingUser && existingUser.user_id !== user.id) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    // Build update object.
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (username !== undefined) {
      updates.username = username;
    }

    if (profile_picture_url !== undefined) {
      updates.profile_picture_url = profile_picture_url;
    }

    // Update profile.
    const { error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
