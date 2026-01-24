"use client";

import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";
import UserStats from "@/components/UserStats";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navigation />

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
