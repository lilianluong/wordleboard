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
          maxWidth: '26rem',
          borderRadius: '12px',
          background: 'var(--surface)',
          padding: '2.5rem',
          boxShadow: '0 4px 16px var(--shadow)',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Wordle Board
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1rem',
            color: 'var(--slate-500)'
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
                color: 'var(--slate-700)',
                marginBottom: '0.5rem'
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
                background: 'var(--mist)',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                color: 'var(--slate-700)'
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
                background: loading ? 'var(--slate-200)' : 'var(--blue-soft)',
                color: 'white',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: loading ? 'none' : '0 2px 6px rgba(107, 155, 209, 0.25)',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'var(--mint)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 155, 209, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'var(--blue-soft)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(107, 155, 209, 0.25)';
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
