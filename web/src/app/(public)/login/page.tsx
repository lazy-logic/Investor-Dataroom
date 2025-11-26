"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { apiClient, APIClientError } from "@/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await apiClient.requestOTP(email);
      
      setSuccess(true);
      
      // Redirect to OTP verification page after 1 second
      setTimeout(() => {
        router.push(`/otp?email=${encodeURIComponent(email)}`);
      }, 1000);
    } catch (err) {
      console.error("Failed to request OTP:", err);
      
      if (err instanceof APIClientError) {
        setError(err.message);
      } else {
        setError("Failed to send login code. Please try again.");
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
          Enter your email to receive a one-time login code for secure access.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            label="Email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            required 
          />
          
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success">
              Login code sent! Redirecting to verification...
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || success}
          >
            {loading ? "Sending..." : success ? "Code Sent!" : "Send Login Code"}
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
