"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { adminApiClient } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const token = adminApiClient.getToken();
    if (token) {
      router.replace("/admin");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      const message = "Email and password are required";
      setError(message);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await adminApiClient.login(email, password);

      showToast({
        variant: "success",
        title: "Signed in",
        description: "You are now signed in as an admin.",
      });

      router.push("/admin");
    } catch (err) {
      let message = "Unable to login as admin";
      if (err instanceof APIClientError) {
        if (err.statusCode === 401) {
          message = "Invalid email or password";
        } else {
          message = err.message || message;
        }
      }
      setError(message);
      showToast({
        variant: "error",
        title: "Unable to login",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Card className="space-y-4 border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin login
        </h1>
        <p className="text-sm text-slate-700">
          Sign in with your admin credentials to manage the investor data room.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {error && (
            <p className="text-xs text-brand-red">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="pt-2 text-xs text-slate-600">
          Don&apos;t have an admin account?{" "}
          <Link
            href="/admin/register"
            className="font-medium text-brand-red hover:underline"
          >
            Register
          </Link>
        </div>
      </Card>
    </div>
  );
}
