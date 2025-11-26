import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          SAYeTECH Investor Data Room
        </h1>
        <p className="text-lg text-slate-600">
          Secure, structured workspace for investor due diligence
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/demo/dashboard"
            className="rounded-lg bg-brand-green px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-brand-green/90"
          >
            View Demo Data Room
          </Link>
          <Link
            href="/request-access"
            className="rounded-lg bg-brand-red px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-brand-red/90"
          >
            Request Access
          </Link>
          <Link
            href="/login"
            className="rounded-lg border-2 border-slate-300 bg-white px-6 py-3 text-lg font-semibold text-slate-700 hover:bg-slate-50"
          >
            Investor Login
          </Link>
        </div>
      </div>
    </div>
  );
}
