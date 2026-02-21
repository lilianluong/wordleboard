"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setStep("code");
      setMessage("Check your email for a 6-digit code. (Check spam if you don't see it.)");
    }

    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      router.push("/");
      router.refresh();
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
        {step === "email" ? (
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
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
                {loading ? "Sending..." : "Send code"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--charcoal)', marginBottom: '1.25rem', fontWeight: '500' }}>
                Code sent to <strong>{email}</strong>
              </p>
              <label
                htmlFor="code"
                style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: 'var(--navy)',
                  marginBottom: '0.625rem'
                }}
              >
                6-digit code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{
                  display: 'block',
                  width: '100%',
                  border: '2px solid var(--border)',
                  background: 'var(--paper)',
                  padding: '0.875rem 1.125rem',
                  fontSize: '1.5rem',
                  color: 'var(--navy)',
                  fontWeight: '700',
                  letterSpacing: '0.3em',
                  textAlign: 'center'
                }}
                placeholder="000000"
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%',
                  background: (loading || code.length !== 6) ? 'var(--charcoal)' : 'var(--purple)',
                  color: 'white',
                  padding: '1rem',
                  fontSize: '1.0625rem',
                  fontWeight: '700',
                  cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                  opacity: (loading || code.length !== 6) ? 0.4 : 1,
                  boxShadow: (loading || code.length !== 6) ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                  border: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading && code.length === 6) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && code.length === 6) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                  }
                }}
              >
                {loading ? "Verifying..." : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setMessage(""); setCode(""); }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: 'var(--charcoal)',
                  padding: '0.625rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
