import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function InvestorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-60 flex-col border-r bg-white/90 px-4 py-4 lg:flex">
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Image
            src="/logo.svg"
            alt="SAYeTECH logo"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-900">
            SAYeTECH Data Room
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <Link
            href="/dashboard"
            className="rounded-md bg-slate-100 px-3 py-2 font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/documents"
            className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100"
          >
            Documents
          </Link>
          <Link
            href="/activity"
            className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100"
          >
            Activity
          </Link>
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="SAYeTECH logo"
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <div className="text-xs uppercase tracking-[0.2em] text-slate-900">
                SAYeTECH Investor Data Room
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-slate-700">
                Investor dashboard
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-200" />
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
