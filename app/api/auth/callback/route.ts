import { createClient } from "@/lib/supabase/server";
import { generateUniqueUsername } from "@/lib/username-utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin));
      }

      // Check if user profile exists to determine if this is a new user.
      let isNewUser = false;
      if (data?.user?.email) {
        const { data: existingProfile } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("user_id", data.user.id)
          .single();

        isNewUser = !existingProfile;

        const username = await generateUniqueUsername(supabase, data.user.email, data.user.id);

        const { error: profileError } = await supabase.from("user_profiles").upsert({
          user_id: data.user.id,
          email: data.user.email,
          username: username,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          // Continue anyway - profile creation is not critical for auth
        }
      }

      // Redirect after successful authentication.
      // New users go to profile page, existing users go to their intended destination.
      const redirectUrl = isNewUser ? "/profile" : next;
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    } catch (error) {
      console.error("Error in auth callback:", error);
      return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin));
    }
  }

  // If no code parameter, redirect to login.
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
