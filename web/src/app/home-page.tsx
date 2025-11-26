import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/navigation/PublicNav";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Helvetica !important' }}>
      <PublicNav showBackButton={false} />

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-green/5 via-transparent to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand-green/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-brand-red/5 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-red opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-red"></span>
                  </span>
                  Deal-Ready Data Room
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Secure investor due diligence,{" "}
                  <span className="text-brand-red">simplified</span>
                </h1>
                
                <p className="text-lg text-slate-600 sm:text-xl">
                  Give investors a professional, structured workspace to review SAYeTECH. 
                  Control access, track engagement, and close deals faster.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/request-access">
                  <Button variant="cta" size="lg" className="shadow-xl">
                    Request Access to Data Room
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg">
                    Already Approved? Login
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-700">OTP</p>
                  <p className="text-xs text-slate-600">Secure Login</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-700">NDA</p>
                  <p className="text-xs text-slate-600">Gated Access</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-700">6</p>
                  <p className="text-xs text-slate-600">Doc Categories</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md space-y-6 border-slate-200 bg-white/80 shadow-2xl backdrop-blur">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-brand-red">
                    What Investors Get
                  </h2>
                  <p className="text-sm text-slate-600">
                    A curated, secure view of SAYeTECH&apos;s company materials, 
                    financials, and legal documents.
                  </p>
                </div>
                
                <ul className="space-y-3">
                  {[
                    "Structured document categories",
                    "NDA-protected access",
                    "Permission-based downloads",
                    "Activity tracking & analytics",
                    "Fast OTP authentication",
                    "Version-controlled files"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/10">
                        <svg className="h-4 w-4 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Document Categories Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Organized for Investor Success
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Six clear categories make due diligence fast and efficient
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Company Overview",
                desc: "Mission, vision, team bios, and organizational structure",
                color: "bg-gradient-to-br from-brand-red to-red-600",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              },
              {
                title: "Market & Impact",
                desc: "Market analysis, competitive landscape, and social impact metrics",
                color: "bg-gradient-to-br from-red-500 to-red-600",
                icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              {
                title: "Financials",
                desc: "Historical financials, projections, and unit economics",
                color: "bg-gradient-to-br from-red-600 to-red-700",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              },
              {
                title: "IP & Technology",
                desc: "Product roadmap, technical architecture, and patents",
                color: "bg-gradient-to-br from-rose-500 to-red-600",
                icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              },
              {
                title: "Traction",
                desc: "Customer metrics, growth data, and key partnerships",
                color: "bg-gradient-to-br from-red-500 to-rose-600",
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              },
              {
                title: "Legal",
                desc: "Cap table, contracts, compliance, and governance docs",
                color: "bg-gradient-to-br from-brand-red to-red-700",
                icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              }
            ].map((cat, i) => (
              <Card 
                key={i} 
                className="group cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cat.color} text-white shadow-lg`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-brand-red">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-slate-600">{cat.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Simple 3-Step Process
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              From request to full data room access in minutes
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Request Access",
                desc: "Submit your details via our secure form. SAYeTECH reviews all requests promptly.",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              },
              {
                step: "02",
                title: "Accept NDA & Login",
                desc: "Receive approval, digitally sign the NDA, and log in securely with OTP authentication.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              },
              {
                step: "03",
                title: "Review Documents",
                desc: "Browse structured categories, preview files, and download (if permitted) all in one secure place.",
                icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              }
            ].map((item, i) => (
              <Card key={i} className="relative overflow-hidden border-slate-200 transition-all hover:border-brand-red hover:shadow-lg">
                <div className="absolute right-4 top-4 text-6xl font-black text-slate-100">
                  {item.step}
                </div>
                <div className="relative space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red/10">
                    <svg className="h-7 w-7 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-red to-brand-red/80 py-20 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTM2IDM0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Review SAYeTECH?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Request access to our secure investor data room and start your due diligence today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/request-access">
              <Button 
                variant="primary" 
                size="lg" 
                className="!bg-white !text-brand-red hover:!bg-slate-50 shadow-xl"
              >
                Request Access Now
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="ghost" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                Investor Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">SAYeTECH</h3>
              <p className="text-sm">
                Secure investor data room with OTP authentication and NDA protection.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/request-access" className="hover:text-white transition">
                    Request Access
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition">
                    Investor Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">About</h3>
              <p className="text-sm">
                SAYeTECH provides innovative agricultural solutions across Africa.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 SAYeTECH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
