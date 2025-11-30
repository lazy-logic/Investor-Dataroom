"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { adminApiClient, type AdminRole } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { showToast } = useToast();

  const [hasSuperAdmin, setHasSuperAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkSuperAdmin = async () => {
      const token = adminApiClient.getToken();
      if (!token) {
        setHasSuperAdmin(null);
        return;
      }

      try {
        const users = await adminApiClient.listUsers();
        if (cancelled) return;

        const has = users.some((u) => u.role === "super_admin");
        setHasSuperAdmin(has);
      } catch {
        if (cancelled) return;
        setHasSuperAdmin(null);
      }
    };

    void checkSuperAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

  const isSpecialEmail =
    email.trim().toLowerCase() === "abstudios220@gmail.com";
  const canChooseSuperAdmin =
    isSpecialEmail && hasSuperAdmin !== true;

  useEffect(() => {
    if (!canChooseSuperAdmin && role === "super_admin") {
      setRole("admin");
    }
  }, [canChooseSuperAdmin, role]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      const message = "All fields are required";
      setError(message);
      setSuccess(null);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      return;
    }

    if (password !== confirmPassword) {
      const message = "Password and confirmation do not match";
      setError(message);
      setSuccess(null);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      return;
    }

    if (password.length < 8) {
      const message = "Password must be at least 8 characters long";
      setError(message);
      setSuccess(null);
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
      setSuccess(null);

      await adminApiClient.register({
        email,
        password,
        full_name: fullName,
        role,
      });

      const message = "Account created successfully. You can now sign in.";
      setSuccess(message);
      showToast({
        variant: "success",
        title: "Admin account created",
        description: message,
      });
      setTimeout(() => {
        router.push("/admin/login");
      }, 1200);
    } catch (err) {
      let message = "Unable to register admin account";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      setSuccess(null);
      showToast({
        variant: "error",
        title: "Unable to register admin account",
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
          Admin registration
        </h1>
        <p className="text-sm text-slate-700">
          Create an admin account for the investor data room backend.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your full name"
          />
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
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
          <div className="flex flex-col gap-1 text-sm">
            <label className="text-sm font-medium text-slate-800">Role</label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as AdminRole)
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              {canChooseSuperAdmin && (
                <option value="super_admin">Super admin</option>
              )}
            </select>
          </div>

          {error && (
            <p className="text-xs text-brand-red">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-brand-green">
              {success}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="pt-2 text-xs text-slate-600">
          Already have an admin account?{" "}
          <Link
            href="/admin/login"
            className="font-medium text-brand-red hover:underline"
          >
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
