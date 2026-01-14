"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthGuard from "@/components/AuthGuard";
import UserAvatar from "@/components/UserAvatar";
import NotificationSettings from "@/components/NotificationSettings";
import { validateUsername } from "@/lib/username-utils";

export const dynamic = "force-dynamic";

interface Profile {
  user_id: string;
  email: string;
  username: string;
  profile_picture_url: string | null;
  updated_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setUsername(data.profile.username);
        setAvatarUrl(data.profile.profile_picture_url);
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size client-side.
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAvatarUrl(data.url);
        setSuccess("Image uploaded! Remember to save your profile.");
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    // Validate username.
    const validation = validateUsername(username);
    if (!validation.valid) {
      setError(validation.error || "Invalid username");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          profile_picture_url: avatarUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        fetchProfile();
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <nav
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "0 1px 3px var(--shadow)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <Link
                href="/"
                style={{
                  fontSize: "1.375rem",
                  fontWeight: "600",
                  color: "var(--slate-700)",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                }}
              >
                Wordle Board
              </Link>
              <div className="flex gap-3">
                <Link
                  href="/"
                  style={{
                    color: "var(--slate-500)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    fontWeight: "500",
                    padding: "0.5rem 1rem",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--slate-700)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--slate-500)")
                  }
                >
                  Dashboard
                </Link>
                <Link
                  href="/submit"
                  style={{
                    color: "var(--slate-500)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    fontWeight: "500",
                    padding: "0.5rem 1rem",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--slate-700)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--slate-500)")
                  }
                >
                  Submit
                </Link>
                <Link
                  href="/stats"
                  style={{
                    color: "var(--slate-500)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    fontWeight: "500",
                    padding: "0.5rem 1rem",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--slate-700)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--slate-500)")
                  }
                >
                  Stats
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
              Profile Settings
            </h1>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--slate-500)",
                fontWeight: "400",
              }}
            >
              Customize your username and profile picture
            </p>
          </div>

          <div
            style={{
              background: "var(--surface)",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 1px 3px var(--shadow)",
            }}
          >
            {/* Avatar Preview */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "var(--slate-700)",
                  marginBottom: "0.75rem",
                }}
              >
                Profile Picture
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <UserAvatar
                  username={username || "User"}
                  avatarUrl={avatarUrl}
                  size="lg"
                  showUsername={false}
                />
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: "none" }}
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    style={{
                      display: "inline-block",
                      background: "var(--blue-soft)",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      cursor: uploading ? "not-allowed" : "pointer",
                      opacity: uploading ? 0.6 : 1,
                    }}
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </label>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--slate-500)",
                      marginTop: "0.5rem",
                    }}
                  >
                    JPG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Username Input */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                htmlFor="username"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "var(--slate-700)",
                  marginBottom: "0.75rem",
                }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Enter username"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  fontSize: "0.9375rem",
                  background: "var(--background)",
                }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--slate-500)",
                  marginTop: "0.5rem",
                }}
              >
                3-20 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            {/* Notification Settings */}
            <NotificationSettings />

            {/* Error/Success Messages */}
            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "#fee",
                  color: "#c00",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "#efe",
                  color: "#060",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                {success}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              style={{
                background: saving ? "var(--slate-400)" : "var(--blue-soft)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontSize: "0.9375rem",
                fontWeight: "600",
                border: "none",
                cursor: saving || uploading ? "not-allowed" : "pointer",
                boxShadow: "0 1px 3px rgba(107, 155, 209, 0.2)",
              }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
