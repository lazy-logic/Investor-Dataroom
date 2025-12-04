"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, APIClientError } from "@/lib/api-client";

function OtpInput({ value, onChange, disabled, hasError }: { value: string; onChange: (v: string) => void; disabled?: boolean; hasError?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const arr = value.split('');
    arr[i] = v;
    onChange(arr.join(''));
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, ''));
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-red/20 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all ${
            hasError 
              ? 'border-red-300 bg-red-50 text-red-600' 
              : value[i] 
                ? 'border-brand-red bg-red-50/30 text-slate-900' 
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-red focus:bg-white'
          }`}
        />
      ))}
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-brand-red border-t-transparent rounded-full" />
      </div>
    }>
      <OtpContent />
    </Suspense>
  );
}

function OtpContent() {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get('email');
  const purpose = searchParams.get('purpose') || 'login';

  useEffect(() => {
    if (!email) router.push('/login');
  }, [email, router]);

  useEffect(() => {
    if (otp.length === 6 && status === "idle") handleVerify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email || otp.length !== 6) return;

    setStatus("loading");
    setError("");

    try {
      const result = await apiClient.verifyOTP(email, otp, purpose);
      
      if (!result.access_token && !result.success) {
        setError("Invalid or expired code.");
        setOtp("");
        setStatus("error");
        return;
      }

      setStatus("success");
      
      if (result.access_token) {
        await login(result.access_token);
        try {
          const nda = await apiClient.checkNDAStatus();
          router.push(nda.accepted ? '/dashboard' : '/nda');
        } catch {
          router.push('/nda');
        }
      } else {
        router.push('/login?verified=true');
      }
    } catch (err) {
      setOtp("");
      if (err instanceof APIClientError) {
        setError(err.message);
      } else {
        setError("Verification failed. Please try again.");
      }
      setStatus("error");
    }
  }

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    setError("");
    setResendSuccess(false);

    try {
      await apiClient.requestOTP(email, purpose);
      setOtp("");
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof APIClientError ? err.message : "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-red to-red-600 px-8 py-8 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              status === "success" 
                ? 'bg-green-500' 
                : 'bg-white/20 backdrop-blur'
            }`}>
              {status === "success" ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {status === "success" ? "Verified!" : "Check Your Email"}
            </h1>
            <p className="text-white/80 text-sm mt-1">
              {status === "success" ? "Logging you in..." : (
                <>We sent a code to <span className="font-semibold text-white">{email}</span></>
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="p-8 space-y-6">
            {status !== "success" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4 text-center">
                    Enter 6-digit code
                  </label>
                  <OtpInput 
                    value={otp} 
                    onChange={(v) => { setOtp(v); setError(""); }} 
                    disabled={status === "loading"} 
                    hasError={status === "error"}
                  />
                </div>

                {status === "error" && error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {resendSuccess && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-700">New code sent!</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || otp.length !== 6}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-red to-red-600 text-white font-semibold rounded-xl hover:from-brand-red/90 hover:to-red-600/90 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-200 active:scale-[0.98]"
                >
                  {status === "loading" ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Verify Code
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  )}
                </button>
              </>
            )}

            {status === "success" && (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-8 w-8 border-4 border-brand-red border-t-transparent rounded-full" />
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        {status !== "success" && (
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive the code?{" "}
              <button 
                onClick={handleResend} 
                disabled={resending} 
                className="text-brand-red hover:text-brand-red/80 font-semibold disabled:opacity-50 transition-colors"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </p>
            <p className="text-xs text-slate-400">
              Code expires in 10 minutes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
