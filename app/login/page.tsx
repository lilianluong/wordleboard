"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(
        "Check your email for the magic link! (If you don't see it, check your spam folder.)"
      );
    }

    setLoading(false);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '28rem',
          borderRadius: '20px',
          background: 'var(--surface)',
          padding: '3rem',
          boxShadow: '0 8px 24px var(--shadow)',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '3rem',
            fontFamily: 'DM Serif Display, Georgia, serif',
            color: 'var(--deep-brown)',
            marginBottom: '0.75rem'
          }}>
            Wordle Board
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.0625rem',
            color: 'var(--chocolate)'
          }}>
            Sign in with your email
          </p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: 'var(--espresso)',
                marginBottom: '0.625rem'
              }}
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                border: '1.5px solid var(--border)',
                background: 'var(--cream)',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                color: 'var(--espresso)'
              }}
              placeholder="you@example.com"
            />
          </div>

          {message && (
            <div
              style={{
                padding: '1.125rem',
                borderRadius: '12px',
                fontSize: '0.9375rem',
                background: message.includes("Error") ? 'var(--error-light)' : 'var(--success-light)',
                color: message.includes("Error") ? 'var(--error)' : 'var(--success)',
                fontWeight: '500'
              }}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'var(--sand)' : 'var(--honey)',
                color: 'white',
                padding: '1rem',
                fontSize: '1.0625rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: loading ? 'none' : '0 4px 12px rgba(196, 144, 96, 0.3)',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'var(--amber)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(196, 144, 96, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'var(--honey)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 144, 96, 0.3)';
                }
              }}
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
