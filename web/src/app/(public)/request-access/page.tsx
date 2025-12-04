"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient, APIClientError } from "@/lib/api-client";

export default function RequestAccessPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const email = data.get("email")?.toString().trim() || "";
    const full_name = data.get("full_name")?.toString().trim() || "";
    const company = data.get("company")?.toString().trim() || "";

    if (!email || !full_name || !company) {
      setError("Please fill in all required fields.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      await apiClient.submitAccessRequest({
        email,
        full_name,
        company,
        phone: data.get("phone")?.toString().trim() || null,
        message: data.get("message")?.toString().trim() || null,
      });
      setStatus("success");
    } catch (err) {
      setError(err instanceof APIClientError ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Request Submitted!</h1>
            <p className="text-slate-600 mb-6">
              We&apos;ll review your request and send you an email once approved. This usually takes 24-48 hours.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-brand-red hover:text-brand-red/80 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-red to-red-600 px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur rounded-xl mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Request Access</h1>
            <p className="text-white/80 text-sm mt-1">Join our investor community</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:bg-white transition-all"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:bg-white transition-all"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  autoComplete="organization"
                  placeholder="Acme Ventures"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:bg-white transition-all"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:bg-white transition-all"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                  Message <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Tell us about your investment interest..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {status === "error" && error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-red to-red-600 text-white font-semibold rounded-xl hover:from-brand-red/90 hover:to-red-600/90 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-200 active:scale-[0.98]"
            >
              {status === "loading" ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have access?{" "}
          <Link href="/login" className="text-brand-red hover:text-brand-red/80 font-semibold transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
