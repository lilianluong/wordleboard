export function generateUsername(email: string): string {
  // Extract part before @, convert to lowercase.
  const base = email.split("@")[0].toLowerCase();
  // Remove special chars, keep alphanumeric and underscore.
  return base.replace(/[^a-z0-9_]/g, "");
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
