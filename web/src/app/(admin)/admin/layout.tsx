"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminApiClient } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";
import { ToastProvider } from "@/components/ui/toast";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = adminApiClient.getToken();

    if (!token) {
      router.push("/admin/login");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        await adminApiClient.getCurrentAdmin();
      } catch (error) {
        if (cancelled) return;

        if (error instanceof APIClientError && error.statusCode === 401) {
          adminApiClient.clearToken();
          router.push("/admin/login");
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    adminApiClient.clearToken();
    router.push("/admin/login");
  };

  const isActive = (href: string) => pathname === href;

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/90 px-4 py-6 lg:flex">
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Image
              src="/logo.svg"
              alt="SAYeTECH logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="rounded-full bg-brand-red/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-brand-red">
              Admin Console
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 text-sm">
          <Link
            href="/admin"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Overview
          </Link>
          <Link
            href="/admin/users"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin/users")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Users
          </Link>
          <Link
            href="/admin/documents"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin/documents")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Documents
          </Link>
          <Link
            href="/admin/access-requests"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin/access-requests")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Access requests
          </Link>
          <Link
            href="/admin/qa"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin/qa")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Q&A
          </Link>
          <Link
            href="/admin/activity"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin/activity")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Activity
          </Link>
          <Link
            href="/admin/permissions"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin/permissions")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Permissions
          </Link>
          <Link
            href="/admin/profile"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin/profile")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Profile
          </Link>
          <Link
            href="/admin/change-password"
            className={`flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              isActive("/admin/change-password")
                ? "border-brand-red bg-brand-red/5 font-semibold text-slate-900"
                : "border-transparent text-slate-600 hover:border-brand-red/40 hover:bg-slate-100"
            }`}
          >
            Change password
          </Link>
          </nav>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="SAYeTECH logo"
                  width={26}
                  height={26}
                  className="h-7 w-auto"
                />
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-900">
                    SAYeTECH Admin Console
                  </div>
                  <div className="text-[11px] text-brand-red">
                    Investor Data Room · Admin
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="relative"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-white"
                  >
                    <span>Admin menu</span>
                    <span className="text-[10px] text-slate-400">
                      {menuOpen ? "▲" : "▼"}
                    </span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white py-1 text-xs text-slate-700 shadow-lg">
                      <Link
                        href="/admin/profile"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                      >
                        Your profile
                      </Link>
                      <Link
                        href="/admin/change-password"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                      >
                        Change password
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 py-1.5 text-left text-brand-red hover:bg-brand-red/5"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
