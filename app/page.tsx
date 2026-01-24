"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthGuard from "@/components/AuthGuard";
import DailyStats from "@/components/DailyStats";
import Leaderboard from "@/components/Leaderboard";
import Navigation from "@/components/Navigation";

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
        <Navigation onSignOut={handleSignOut} showSignOut={!!user} />

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 style={{
              fontSize: '2rem',
              marginBottom: '1.5rem',
              fontWeight: '800',
              color: 'var(--navy)'
            }}>
              Today's Results
            </h2>
            <DailyStats />
          </div>

          <div>
            <h2 style={{
              fontSize: '2rem',
              marginBottom: '1.5rem',
              fontWeight: '800',
              color: 'var(--navy)'
            }}>
              Global Leaderboard
            </h2>
            <Leaderboard />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
