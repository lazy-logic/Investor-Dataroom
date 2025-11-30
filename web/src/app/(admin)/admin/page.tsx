"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { adminApiClient, type AdminUser } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  pendingAccessRequests: number;
}

export default function AdminHomePage() {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    pendingAccessRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [admin, users, accessRequests] = await Promise.all([
          adminApiClient.getCurrentAdmin(),
          adminApiClient.listUsers(),
          adminApiClient.listAccessRequests(),
        ]);

        if (cancelled) return;

        const totalUsers = users.length;
        const totalAdmins = users.filter(
          (u) => u.role === "admin" || u.role === "super_admin",
        ).length;
        const pendingAccessRequests = accessRequests.filter(
          (r) => r.status === "pending",
        ).length;

        setCurrentAdmin(admin);
        setStats({ totalUsers, totalAdmins, pendingAccessRequests });
      } catch (err) {
        if (cancelled) return;

        if (err instanceof APIClientError) {
          setError(err.message || "Unable to load admin overview");
        } else {
          setError("Unable to load admin overview");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const adminName = currentAdmin?.full_name || "Admin";
  const adminRole = currentAdmin?.role.replace("_", " ") ?? "admin";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-brand-red to-brand-red/80 px-6 py-5 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-white/70">
          Welcome back
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {adminName}, you&apos;re in control.
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Use the admin console to manage access, documents, and security
              for the investor data room.
            </p>
            <p className="mt-2 text-xs text-white/80">
              Signed in as{" "}
              <span className="font-medium text-brand-pink">{adminRole}</span>.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/access-requests">
              <Button size="sm" variant="cta">
                Review access requests
              </Button>
            </Link>
            <Link href="/admin/documents">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 text-brand-red hover:bg-white"
              >
                Manage documents
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col justify-between border-slate-200 bg-white/80 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              <span>Users</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {stats.totalAdmins} admin
                {stats.totalAdmins === 1 ? "" : "s"}
              </span>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">
                {stats.totalUsers}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Total investor accounts with access to the data room.
              </p>
            </div>
          </div>
          <Link href="/admin/users" className="mt-4">
            <Button size="sm" variant="secondary" className="w-full">
              Go to users
            </Button>
          </Link>
        </Card>

        <Card className="flex flex-col justify-between border-slate-200 bg-white/80 p-4">
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Access requests
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-900">
                {stats.pendingAccessRequests}
              </span>
              <span className="text-xs text-slate-500">
                pending decision
                {stats.pendingAccessRequests === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Approve or deny investor access requests and control expiry.
            </p>
          </div>
          <Link href="/admin/access-requests" className="mt-4">
            <Button size="sm" className="w-full">
              Review requests
            </Button>
          </Link>
        </Card>

        <Card className="flex flex-col justify-between border-slate-200 bg-white/80 p-4">
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Security &amp; configuration
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Keep your data room secure by managing permission levels and admin
              credentials.
            </p>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-xs">
            <Link href="/admin/permissions">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full justify-start text-slate-700"
              >
                Permission levels
              </Button>
            </Link>
            <Link href="/admin/profile">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full justify-start text-slate-700"
              >
                Your profile
              </Button>
            </Link>
            <Link href="/admin/change-password">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full justify-start text-slate-700"
              >
                Change password
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {loading && (
        <p className="text-xs text-slate-500">Loading latest stats...</p>
      )}
    </div>
  );
}
