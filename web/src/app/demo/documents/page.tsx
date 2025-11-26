"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function DemoDocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Company Overview");

  const categories = [
    { name: "Company Overview", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "blue" },
    { name: "Market & Impact", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "purple" },
    { name: "Financials", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "emerald" },
    { name: "IP & Technology", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "orange" },
    { name: "Traction", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "pink" },
    { name: "Legal", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3", color: "red" }
  ];

  const documents = {
    "Company Overview": [
      { name: "SAYeTECH Pitch Deck 2025.pdf", size: "4.2 MB", updated: "2 days ago", version: "v3" },
      { name: "Executive Summary.pdf", size: "1.1 MB", updated: "1 week ago", version: "v2" },
      { name: "Team Bios.pdf", size: "850 KB", updated: "2 weeks ago", version: "v1" }
    ],
    "Market & Impact": [
      { name: "Market Analysis Report.pdf", size: "3.5 MB", updated: "3 days ago", version: "v2" },
      { name: "Impact Metrics Dashboard.xlsx", size: "2.1 MB", updated: "1 week ago", version: "v1" }
    ],
    "Financials": [
      { name: "Financial Model 2025-2028.xlsx", size: "5.8 MB", updated: "1 day ago", version: "v4" },
      { name: "Historical Financials.pdf", size: "1.9 MB", updated: "1 week ago", version: "v1" },
      { name: "Unit Economics.xlsx", size: "1.2 MB", updated: "2 weeks ago", version: "v2" }
    ],
    "IP & Technology": [
      { name: "Product Roadmap.pdf", size: "2.3 MB", updated: "5 days ago", version: "v2" },
      { name: "Technical Architecture.pdf", size: "3.1 MB", updated: "1 week ago", version: "v1" }
    ],
    "Traction": [
      { name: "Growth Metrics Q4 2024.pdf", size: "1.7 MB", updated: "3 days ago", version: "v1" },
      { name: "Customer Case Studies.pdf", size: "4.5 MB", updated: "1 week ago", version: "v2" }
    ],
    "Legal": [
      { name: "Cap Table.xlsx", size: "890 KB", updated: "2 days ago", version: "v5" },
      { name: "Articles of Incorporation.pdf", size: "1.5 MB", updated: "3 months ago", version: "v1" },
      { name: "Material Contracts.pdf", size: "6.2 MB", updated: "1 month ago", version: "v2" }
    ]
  };

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
            <Link href="/demo/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-brand-red transition">
              Dashboard
            </Link>
            <Link href="/demo/documents" className="rounded-lg bg-brand-red px-4 py-2 text-sm font-medium text-white shadow-md">
              Documents
            </Link>
            <Link href="/demo/nda" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-brand-red transition">
              NDA
            </Link>
            <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              Exit Demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-brand-red/5 -mr-12 -mt-12" />
              <div className="relative">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Categories</h2>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        selectedCategory === cat.name
                          ? "bg-brand-red text-white font-semibold shadow-md"
                          : "text-slate-700 hover:bg-red-100/50 hover:text-brand-red"
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
                      </svg>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Card className="p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quick Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Documents</span>
                  <span className="font-semibold text-slate-900">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Updated</span>
                  <span className="font-semibold text-slate-900">1 day ago</span>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {selectedCategory}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {documents[selectedCategory as keyof typeof documents]?.length || 0} documents available
                </p>
              </div>
              <input
                placeholder="Search documents..."
                className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus-visible:border-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
              />
            </div>

            <div className="space-y-3">
              {documents[selectedCategory as keyof typeof documents]?.map((doc, i) => (
                <div key={i} className="group cursor-pointer transition hover:scale-[1.01]">
                  <div className="relative overflow-hidden rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm transition hover:shadow-lg hover:border-brand-red">
                    <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-brand-red/5 -mr-8 -mt-8" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-brand-red to-red-600 p-3 shadow-md">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 group-hover:text-brand-red transition">
                              {doc.name}
                            </p>
                            <span className="rounded-full bg-brand-red/10 px-2.5 py-0.5 text-xs font-semibold text-brand-red">
                              {doc.version}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {doc.size} • Updated {doc.updated}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-white hover:text-brand-red hover:border-brand-red">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="rounded-lg bg-brand-red p-2 text-white shadow-md transition hover:bg-red-700">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
