import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="SAYeTECH"
              className="h-10 w-auto"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
                SAYeTECH
              </p>
              <p className="text-xs text-slate-600">Investor Data Room</p>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/dashboard" className="rounded-lg bg-brand-red px-4 py-2 text-sm font-medium text-white shadow-md">
              Dashboard
            </Link>
            <Link href="/documents" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-brand-red transition">
              Documents
            </Link>
            <Link href="/nda" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-brand-red transition">
              NDA
            </Link>
            <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              Exit Data Room
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8 shadow-sm">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-slate-100/50 -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-slate-100/30 -ml-12 -mb-12" />
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome to SAYeTECH Investor Data Room
              </h1>
              <p className="mt-3 text-base text-slate-600">
                High-level overview of SAYeTECH and quick access to key documents.
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 -mr-12 -mt-12" />
              <div className="relative flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-medium text-white/90">Round Details</h2>
                  <p className="mt-3 text-3xl font-bold text-white">Series A</p>
                  <p className="mt-1 text-sm text-white/80">Raising $2M - $5M</p>
                </div>
                <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 -mr-12 -mt-12" />
              <div className="relative flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-medium text-white/90">Key Metrics</h2>
                  <p className="mt-3 text-3xl font-bold text-white">50K+</p>
                  <p className="mt-1 text-sm text-white/80">Farmers reached across Africa</p>
                </div>
                <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 -mr-12 -mt-12" />
              <div className="relative flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-medium text-white/90">Access Status</h2>
                  <p className="mt-3 text-3xl font-bold text-white">Active</p>
                  <p className="mt-1 text-sm text-white/80">Full access to investor data room</p>
                </div>
                <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Start Your Review</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/documents" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg transition hover:shadow-xl hover:scale-105">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -mr-8 -mt-8" />
                  <div className="relative">
                    <div className="mb-3 inline-flex rounded-lg bg-white/20 p-2.5 backdrop-blur-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Pitch Deck</h3>
                    <p className="text-sm text-white/90">Company overview presentation</p>
                  </div>
                </div>
              </Link>

              <Link href="/documents" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg transition hover:shadow-xl hover:scale-105">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -mr-8 -mt-8" />
                  <div className="relative">
                    <div className="mb-3 inline-flex rounded-lg bg-white/20 p-2.5 backdrop-blur-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Financial Model</h3>
                    <p className="text-sm text-white/90">Projections and actuals</p>
                  </div>
                </div>
              </Link>

              <Link href="/documents" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg transition hover:shadow-xl hover:scale-105">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -mr-8 -mt-8" />
                  <div className="relative">
                    <div className="mb-3 inline-flex rounded-lg bg-white/20 p-2.5 backdrop-blur-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Legal Documents</h3>
                    <p className="text-sm text-white/90">Cap table, contracts, compliance</p>
                  </div>
                </div>
              </Link>

              <Link href="/documents" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg transition hover:shadow-xl hover:scale-105">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -mr-8 -mt-8" />
                  <div className="relative">
                    <div className="mb-3 inline-flex rounded-lg bg-white/20 p-2.5 backdrop-blur-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Market Analysis</h3>
                    <p className="text-sm text-white/90">Industry insights and TAM</p>
                  </div>
                </div>
              </Link>

              <Link href="/documents" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg transition hover:shadow-xl hover:scale-105">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -mr-8 -mt-8" />
                  <div className="relative">
                    <div className="mb-3 inline-flex rounded-lg bg-white/20 p-2.5 backdrop-blur-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Team Profiles</h3>
                    <p className="text-sm text-white/90">Leadership and advisors</p>
                  </div>
                </div>
              </Link>

              <Link href="/documents" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-6 shadow-lg transition hover:shadow-xl hover:scale-105">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -mr-8 -mt-8" />
                  <div className="relative">
                    <div className="mb-3 inline-flex rounded-lg bg-white/20 p-2.5 backdrop-blur-sm">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Product Overview</h3>
                    <p className="text-sm text-white/90">Platform walkthrough</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: "Viewed Pitch Deck", time: "2 hours ago", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
                { action: "Downloaded Financial Model", time: "1 day ago", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" },
                { action: "Accepted NDA", time: "2 days ago", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50/30 p-4 transition hover:bg-red-50/50 hover:border-brand-red">
                  <div className="rounded-lg bg-brand-red/10 p-2.5">
                    <svg className="h-5 w-5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
