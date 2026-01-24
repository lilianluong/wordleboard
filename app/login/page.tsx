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
          borderRadius: '12px',
          background: 'var(--surface)',
          padding: '3rem',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          border: '2px solid var(--border)'
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: '900',
            marginBottom: '0.75rem'
          }}>
            Wordle Board
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.0625rem',
            color: 'var(--charcoal)',
            fontWeight: '500'
          }}>
            Sign in with your email
          </p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.9375rem',
                fontWeight: '700',
                color: 'var(--navy)',
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
                border: '2px solid var(--border)',
                background: 'var(--paper)',
                padding: '0.875rem 1.125rem',
                fontSize: '1rem',
                color: 'var(--navy)',
                fontWeight: '500'
              }}
              placeholder="you@example.com"
            />
          </div>

          {message && (
            <div
              style={{
                padding: '1.125rem',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                background: message.includes("Error") ? 'var(--error)' : 'var(--wordle-green)',
                color: 'white',
                fontWeight: '600'
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
                background: loading ? 'var(--charcoal)' : 'var(--purple)',
                color: 'white',
                padding: '1rem',
                fontSize: '1.0625rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.4 : 1,
                boxShadow: loading ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                border: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
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
