export function generateUsername(email: string): string {
  // Extract part before @, convert to lowercase.
  const base = email.split("@")[0].toLowerCase();
  // Remove special chars, keep alphanumeric and underscore.
  return base.replace(/[^a-z0-9_]/g, "");
}

export async function generateUniqueUsername(
  supabase: any,
  email: string,
  userId: string
): Promise<string> {
  const baseUsername = generateUsername(email);

  // Try base username first.
  const { data: existingUser } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("username", baseUsername)
    .single();

  // If no conflict, use base username.
  if (!existingUser) {
    return baseUsername;
  }

  // If conflict, append first 4 characters of user ID.
  return `${baseUsername}_${userId.substring(0, 4)}`;
}

export function validateUsername(
  username: string
): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: "Must be at least 3 characters" };
  }
  if (username.length > 20) {
    return { valid: false, error: "Must be 20 characters or less" };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return {
      valid: false,
      error: "Only letters, numbers, and underscores allowed",
    };
  }
  return { valid: true };
}
