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
          borderBottom: '2px solid var(--border)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
        }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <Link
                href="/"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: 'var(--navy)',
                  textDecoration: 'none',
                  letterSpacing: '-0.02em'
                }}
              >
                Wordle Board
              </Link>
              <div className="flex items-center gap-1 sm:gap-3">
                <Link
                  href="/submit"
                  className="text-sm sm:text-[0.9375rem] px-2.5 sm:px-5"
                  style={{
                    background: 'var(--purple)',
                    color: 'white',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.25)';
                  }}
                >
                  Submit
                </Link>
                <Link
                  href="/stats"
                  className="text-sm sm:text-[0.9375rem] px-2 sm:px-4"
                  style={{
                    color: 'var(--charcoal)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    padding: '0.625rem 0.75rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--purple)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--charcoal)'}
                >
                  Stats
                </Link>
                <Link
                  href="/profile"
                  className="text-sm sm:text-[0.9375rem] px-2 sm:px-4"
                  style={{
                    color: 'var(--charcoal)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    padding: '0.625rem 0.75rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--purple)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--charcoal)'}
                >
                  Profile
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
              color: 'var(--charcoal)',
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
