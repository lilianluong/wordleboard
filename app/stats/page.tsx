"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import UserStats from "@/components/UserStats";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Wordle Board
              </Link>
              <div className="flex gap-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/submit"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Submit
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">User Statistics</h1>
            <p className="mt-2 text-gray-600">
              View detailed stats for each player
            </p>
          </div>

          <UserStats />
        </main>
      </div>
    </AuthGuard>
  );
}
