"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import UserStats from "@/components/UserStats";

export const dynamic = "force-dynamic";

export default function StatsPage() {
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
                  fontSize: '1.375rem',
                  fontWeight: '600',
                  color: 'var(--slate-700)',
                  textDecoration: 'none',
                  letterSpacing: '-0.01em'
                }}
              >
                Wordle Board
              </Link>
              <div className="flex gap-3">
                <Link
                  href="/"
                  style={{
                    color: 'var(--slate-500)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--slate-700)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--slate-500)'}
                >
                  Dashboard
                </Link>
                <Link
                  href="/submit"
                  style={{
                    color: 'var(--slate-500)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--slate-700)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--slate-500)'}
                >
                  Submit
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '0.5rem'
            }}>
              User Statistics
            </h1>
            <p style={{
              fontSize: '1.0625rem',
              color: 'var(--slate-500)',
              fontWeight: '400'
            }}>
              View detailed stats for each player
            </p>
          </div>

          <UserStats />
        </main>
      </div>
    </AuthGuard>
  );
}
