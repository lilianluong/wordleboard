"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthGuard from "@/components/AuthGuard";
import DailyStats from "@/components/DailyStats";

export const dynamic = "force-dynamic";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <nav style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 3px var(--shadow)'
        }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <Link
                href="/"
                style={{
                  fontSize: '1.5rem',
                  fontFamily: 'DM Serif Display, Georgia, serif',
                  color: 'var(--deep-brown)',
                  textDecoration: 'none'
                }}
              >
                Wordle Board
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/submit"
                  style={{
                    background: 'var(--honey)',
                    color: 'white',
                    padding: '0.625rem 1.5rem',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(196, 144, 96, 0.25)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--amber)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--honey)'}
                >
                  Submit
                </Link>
                <Link
                  href="/stats"
                  style={{
                    color: 'var(--chocolate)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    padding: '0.625rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--espresso)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--chocolate)'}
                >
                  Stats
                </Link>
                {user && (
                  <button
                    onClick={handleSignOut}
                    style={{
                      color: 'var(--chocolate)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.625rem 1rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--espresso)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--chocolate)'}
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 style={{
              fontSize: '2.75rem',
              marginBottom: '0.75rem',
              fontFamily: 'DM Serif Display, Georgia, serif',
              color: 'var(--deep-brown)'
            }}>
              Dashboard
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--chocolate)',
              fontWeight: '400'
            }}>
              See how everyone did on today's Wordle
            </p>
          </div>

          <DailyStats />
        </main>
      </div>
    </AuthGuard>
  );
}
