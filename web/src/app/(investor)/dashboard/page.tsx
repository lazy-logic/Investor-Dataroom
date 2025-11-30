"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient, APIClientError } from "@/lib/api-client";
import { useRequireNDA } from "@/contexts/AuthContext";

type InvestorPermissions = {
  can_view?: boolean;
  can_download?: boolean;
  has_expiry?: boolean;
  expires_at?: string | null;
  [key: string]: unknown;
};

export default function InvestorDashboardPage() {
  const { user, ndaStatus, loading, error } = useRequireNDA();
  const [permissions, setPermissions] = useState<InvestorPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadPermissions = async () => {
      try {
        setPermissionsLoading(true);
        setPermissionsError(null);
        const data = await apiClient.getUserPermissions(user.id);
        if (!cancelled && data && typeof data === "object") {
          setPermissions(data as InvestorPermissions);
        }
      } catch (err) {
        if (cancelled) return;
        let message = "Unable to load access permissions";
        if (err instanceof APIClientError) {
          message = err.message || message;
        }
        setPermissionsError(message);
      } finally {
        if (!cancelled) {
          setPermissionsLoading(false);
        }
      }
    };

    void loadPermissions();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setCategoryError(null);
        const cats = await apiClient.getCategories();
        if (!cancelled && Array.isArray(cats)) {
          setCategoryCount(cats.length);
        }
      } catch (err) {
        if (cancelled) return;
        let message = "Unable to load document categories";
        if (err instanceof APIClientError) {
          message = err.message || message;
        }
        setCategoryError(message);
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (iso?: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
  };

  const accessExpiry =
    (permissions && typeof permissions.expires_at === "string" && permissions.expires_at) ||
    ndaStatus?.accepted_at ||
    null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          SAYeTECH Investor Data Room
        </h1>
        <p className="text-sm text-slate-600">
          High-level overview of SAYeTECH and quick links to key documents.
        </p>
        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <h2 className="text-sm font-medium text-slate-700">Round details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Your investor profile is linked to <span className="font-medium">{user?.email}</span>.
            For current round size, valuation, and terms, please refer to the
            latest round documents in the data room.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-3 text-xs"
          >
            View round documents
          </Button>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-sm font-medium text-slate-700">Key metrics</h2>
          <p className="mt-1 text-xs text-slate-500">
            You have access to structured document categories that mirror the
            admin data room.
          </p>
          <div className="mt-2 text-xs text-slate-700">
            <div className="flex items-baseline justify-between">
              <span>Document categories</span>
              <span className="font-mono text-[11px]">
                {categoryCount !== null ? categoryCount : "-"}
              </span>
            </div>
            {categoryError && (
              <p className="mt-1 text-[11px] text-red-600">{categoryError}</p>
            )}
          </div>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-sm font-medium text-slate-700">Access status</h2>
          <p className="mt-1 text-xs text-slate-600">
            Signed in as <span className="font-medium">{user?.name}</span>{" "}
            ({user?.email}).
          </p>
          <div className="mt-2 space-y-1 text-xs text-slate-700">
            <div>
              <span className="font-medium">NDA status:</span>{" "}
              {ndaStatus?.accepted ? "Accepted" : "Pending"}
              {ndaStatus?.accepted && ndaStatus.accepted_at && (
                <span className="text-slate-500">
                  {" "}
                  (since {formatDate(ndaStatus.accepted_at)})
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">Permissions:</span>{" "}
              {permissionsLoading && <span>Loading...</span>}
              {!permissionsLoading && !permissions && <span>Not available</span>}
              {!permissionsLoading && permissions && (
                <span>
                  {permissions.can_view ? "Can view" : "View only as allowed"}
                  {" · "}
                  {permissions.can_download ? "Can download" : "No downloads"}
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">Access expiry:</span>{" "}
              {accessExpiry ? formatDate(accessExpiry) : "No expiry set"}
            </div>
            {permissionsError && (
              <p className="mt-1 text-[11px] text-red-600">{permissionsError}</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="space-y-2">
        <h2 className="text-sm font-medium text-slate-700">Start your review</h2>
        <p className="mt-2 text-xs text-slate-500">
          Use the left navigation to explore structured categories like Company
          Overview, Financials, and Legal. Your access controls what you can
          view and download.
        </p>
      </Card>
    </div>
  );
}
