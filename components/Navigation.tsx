"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NavigationProps {
  onSignOut?: () => void;
  showSignOut?: boolean;
}

export default function Navigation({ onSignOut, showSignOut = false }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
    }

    setDeferredPrompt(null);
  };

  return (
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

            {/* Install button */}
            {showInstall && (
              <button
                onClick={handleInstall}
                style={{
                  background: 'var(--gold)',
                  color: 'var(--navy)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.25)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(251, 191, 36, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.25)';
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

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
                    href="/"
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
                    Dashboard
                  </Link>
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
                      borderTop: '1px solid var(--border)',
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
                  {showSignOut && onSignOut && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onSignOut();
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
  );
}
