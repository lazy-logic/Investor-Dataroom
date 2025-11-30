"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient, APIClientError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required to request a login code.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiClient.requestOTP(trimmedEmail);

      router.push(`/otp?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (err) {
      if (err instanceof APIClientError) {
        setError(err.message || "Unable to send login code. Please try again.");
      } else {
        setError("Unable to send login code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Card className="space-y-4 border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Investor Login
        </h1>
        <p className="text-sm text-slate-700">
          Enter your email address to receive a one-time login code. After
          logging in, you&apos;ll review and accept our NDA before entering the
          investor dashboard.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            label="Email" 
            type="email" 
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-white" />
            )}
            {loading ? "Sending code..." : "Send login code"}
          </Button>
        </form>
      </Card>
      
      <Link
        href="/request-access"
        className="inline-flex w-full items-center justify-center rounded-md bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
      >
        New to SAYeTECH? Request Access
      </Link>
    </div>
  );
}
