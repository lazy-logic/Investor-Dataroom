"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function DemoNdaPage() {
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 font-[Helvetica]">
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
            <Link href="/demo/documents" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-brand-red transition">
              Documents
            </Link>
            <Link href="/demo/nda" className="rounded-lg bg-brand-red px-4 py-2 text-sm font-medium text-white shadow-md">
              NDA
            </Link>
            <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              Exit Demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Non-Disclosure Agreement
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Please review and accept the NDA before accessing sensitive documents
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* NDA Content */}
            <Card className="max-h-[60vh] overflow-y-auto border-brand-green/20">
              <div className="space-y-4 text-sm leading-relaxed text-slate-700">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">
                    SAYeTECH Investor Non-Disclosure Agreement
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">Version 2.0 • Effective January 2025</p>
                </div>

                <div className="space-y-4">
                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900">1. Purpose</h3>
                    <p>
                      This Non-Disclosure Agreement (the &quot;Agreement&quot;) is entered into between SAYeTECH 
                      (&quot;Disclosing Party&quot;) and the investor (&quot;Receiving Party&quot;) for the purpose 
                      of evaluating a potential investment opportunity. The Disclosing Party agrees to share 
                      certain confidential and proprietary information with the Receiving Party under the terms 
                      and conditions set forth herein.
                    </p>
                  </section>

                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900">2. Definition of Confidential Information</h3>
                    <p>
                      &quot;Confidential Information&quot; means all information, whether written, oral, electronic, 
                      or visual, disclosed by the Disclosing Party to the Receiving Party, including but not limited to:
                    </p>
                    <ul className="ml-6 mt-2 list-disc space-y-1">
                      <li>Business plans, strategies, and financial projections</li>
                      <li>Technical data, product designs, and intellectual property</li>
                      <li>Customer lists, market research, and competitive analyses</li>
                      <li>Trade secrets, know-how, and proprietary processes</li>
                      <li>Any information marked as &quot;Confidential&quot; or that would reasonably be considered confidential</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900">3. Obligations of Receiving Party</h3>
                    <p>The Receiving Party agrees to:</p>
                    <ul className="ml-6 mt-2 list-disc space-y-1">
                      <li>
                        Use the Confidential Information solely for the purpose of evaluating the potential investment 
                        in SAYeTECH
                      </li>
                      <li>
                        Maintain the confidentiality of all Confidential Information using the same degree of care 
                        used to protect its own confidential information, but no less than reasonable care
                      </li>
                      <li>
                        Not disclose any Confidential Information to third parties without prior written consent 
                        from the Disclosing Party
                      </li>
                      <li>
                        Limit access to Confidential Information to employees, advisors, and representatives who 
                        have a legitimate need to know and who are bound by confidentiality obligations
                      </li>
                      <li>
                        Not copy, reproduce, or create derivative works from the Confidential Information without 
                        express written permission
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900">4. Exclusions</h3>
                    <p>
                      Confidential Information does not include information that:
                    </p>
                    <ul className="ml-6 mt-2 list-disc space-y-1">
                      <li>Is or becomes publicly available through no breach of this Agreement</li>
                      <li>Was rightfully in the Receiving Party&apos;s possession prior to disclosure</li>
                      <li>Is independently developed by the Receiving Party without use of Confidential Information</li>
                      <li>Is rightfully obtained from a third party without breach of confidentiality obligations</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900">5. Return or Destruction of Materials</h3>
                    <p>
                      Upon request by the Disclosing Party, or upon termination of discussions, the Receiving Party 
                      shall promptly return or destroy all Confidential Information, including all copies, notes, 
                      and derivatives thereof, and certify in writing that such action has been completed.
                    </p>
                  </section>

                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900">6. No License or Warranty</h3>
                    <p>
                      Nothing in this Agreement grants the Receiving Party any license, right, or interest in any 
                      intellectual property of the Disclosing Party. All Confidential Information is provided 
                      &quot;as is&quot; without any warranty, express or implied.
                    </p>
                  </section>

                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900">7. Term and Termination</h3>
                    <p>
                      This Agreement shall remain in effect for a period of three (3) years from the date of 
                      acceptance. The obligations of confidentiality shall survive termination of this Agreement.
                    </p>
                  </section>

                  <section>
                    <h3 className="mb-2 font-semibold text-slate-900">8. Governing Law</h3>
                    <p>
                      This Agreement shall be governed by and construed in accordance with the laws of the 
                      jurisdiction in which SAYeTECH is incorporated, without regard to conflict of law principles.
                    </p>
                  </section>
                </div>
              </div>
            </Card>

            {/* Summary & Info */}
            <div className="space-y-4">
              <Card className="border-emerald-100 bg-emerald-50/50">
                <h3 className="mb-3 font-semibold text-slate-900">Key Points</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Use information for evaluation purposes only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No sharing or redistribution without consent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Return or destroy materials on request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>3-year confidentiality term</span>
                  </li>
                </ul>
              </Card>

              <Card>
                <h3 className="mb-3 font-semibold text-slate-900">Acceptance Details</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-900">Timestamp:</span> Will be logged upon acceptance
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">IP Address:</span> Will be recorded for security
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Version:</span> 2.0 (January 2025)
                  </p>
                </div>
              </Card>

              <Card className="border-amber-100 bg-amber-50/50">
                <div className="flex gap-2">
                  <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-amber-800">
                    Your acceptance will be legally binding and logged with timestamp and IP address.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Acceptance Section */}
          <Card className="border-brand-green/20">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                />
                <div className="text-sm">
                  <p className="font-medium text-slate-900">
                    I have read and agree to the Non-Disclosure Agreement above
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Your acceptance will be logged with timestamp and IP address for legal purposes
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full legal name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus-visible:border-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                  />
                </div>
                <Link href="/demo/dashboard">
                  <Button
                    variant="cta"
                    size="lg"
                    disabled={!agreed || !fullName.trim()}
                    className="w-full sm:w-auto"
                  >
                    Accept NDA & Enter Data Room
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
