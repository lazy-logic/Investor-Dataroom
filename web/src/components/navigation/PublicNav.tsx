import Link from "next/link";

interface PublicNavProps {
  showBackButton?: boolean;
}

export function PublicNav({ showBackButton = false }: PublicNavProps) {
  return (
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
          {showBackButton && (
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          )}
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Investor Login
          </Link>
          <Link
            href="/request-access"
            className="rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-red/90 hover:shadow-xl"
          >
            Request Access
          </Link>
        </nav>
      </div>
    </header>
  );
}
