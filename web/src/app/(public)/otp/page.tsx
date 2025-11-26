"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, APIClientError } from "@/lib/api-client";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return; // Only allow digits

    const newValue = value.split('');
    newValue[index] = digit;
    onChange(newValue.join(''));

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData.padEnd(6, ''));
    }
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="h-11 w-10 rounded-md border border-slate-300 bg-white text-center text-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red disabled:opacity-50"
        />
      ))}
    </div>
  );
}

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email) {
      setError("Email is missing. Please start from the login page.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Verify OTP and get token
      const response = await apiClient.verifyOTP(email, otp);
      
      // Login with token (this will fetch user data and NDA status)
      await login(response.access_token);

      // Check NDA status and redirect accordingly
      const ndaStatus = await apiClient.checkNDAStatus();
      
      if (ndaStatus.accepted) {
        router.push('/dashboard');
      } else {
        router.push('/nda');
      }
    } catch (err) {
      console.error("Failed to verify OTP:", err);
      
      if (err instanceof APIClientError) {
        if (err.statusCode === 401) {
          setError("Invalid or expired code. Please try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!email) return;

    try {
      setError(null);
      await apiClient.requestOTP(email);
      setOtp("");
      // Show success message (you could add a success state)
    } catch (err) {
      console.error("Failed to resend code:", err);
      setError("Failed to resend code. Please try again.");
    }
  }

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Card>
        <h1 className="mb-1 text-xl font-semibold tracking-tight">
          Enter Your Login Code
        </h1>
        <p className="mb-4 text-sm text-slate-600">
          We&apos;ve sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue.
        </p>
        <form className="space-y-4" onSubmit={handleVerify}>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify and Continue"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResendCode}
            className="text-sm text-brand-red hover:underline"
          >
            Didn&apos;t receive a code? Resend
          </button>
        </div>
      </Card>
      
      <Link
        href="/login"
        className="text-center text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to login
      </Link>
    </div>
  );
}
