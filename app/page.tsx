"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthGuard from "@/components/AuthGuard";
import DailyStats from "@/components/DailyStats";
import Leaderboard from "@/components/Leaderboard";

export const dynamic = "force-dynamic";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpen]);

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
          borderBottom: '2px solid var(--border)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
        }}>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="flex h-16 sm:h-20 items-center justify-between">
              <Link
                href="/"
                className="text-lg sm:text-[1.75rem]"
                style={{
                  fontWeight: '800',
                  color: 'var(--navy)',
                  textDecoration: 'none',
                  letterSpacing: '-0.02em'
                }}
              >
                Wordle Board
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/submit"
                  style={{
                    background: 'var(--purple)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.875rem',
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

                {/* Hamburger menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(!menuOpen);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      width: '28px',
                      height: '28px',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '2px',
                      background: 'var(--navy)',
                      borderRadius: '2px',
                      transition: 'all 0.2s ease'
                    }} />
                    <span style={{
                      width: '20px',
                      height: '2px',
                      background: 'var(--navy)',
                      borderRadius: '2px',
                      transition: 'all 0.2s ease'
                    }} />
                    <span style={{
                      width: '20px',
                      height: '2px',
                      background: 'var(--navy)',
                      borderRadius: '2px',
                      transition: 'all 0.2s ease'
                    }} />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      right: 0,
                      background: 'var(--surface)',
                      border: '2px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
                      minWidth: '160px',
                      zIndex: 50,
                      overflow: 'hidden'
                    }}>
                      <Link
                        href="/stats"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '0.75rem 1rem',
                          color: 'var(--navy)',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--paper)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Stats
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '0.75rem 1rem',
                          color: 'var(--navy)',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          borderTop: '1px solid var(--border)',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--paper)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Profile
                      </Link>
                      {user && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            handleSignOut();
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.75rem 1rem',
                            color: 'var(--navy)',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            background: 'transparent',
                            border: 'none',
                            borderTop: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--paper)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Sign Out
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

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
