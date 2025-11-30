"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import {
  adminApiClient,
  type AdminAccessRequest,
  type AdminAccessRequestUpdatePayload,
} from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

function toLocalDateTimeInputValue(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export default function AdminAccessRequestsPage() {
  const [requests, setRequests] = useState<AdminAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updateExpiresAt, setUpdateExpiresAt] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSaving, setUpdateSaving] = useState(false);
  const { showToast } = useToast();

  const loadRequests = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiClient.listAccessRequests(status);
      setRequests(data);
    } catch (err) {
      let message = "Unable to load access requests";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      showToast({
        variant: "error",
        title: "Unable to load access requests",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleApplyFilter = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadRequests(statusFilter || undefined);
  };

  const openEdit = (request: AdminAccessRequest) => {
    setSelectedId(request.id);
    setUpdateStatus(typeof request.status === "string" ? request.status : "");
    setUpdateNotes(typeof request.admin_notes === "string" ? request.admin_notes : "");
    setUpdateExpiresAt(toLocalDateTimeInputValue(request.expires_at as string | undefined));
    setUpdateError(null);
  };

  const cancelEdit = () => {
    setSelectedId(null);
    setUpdateStatus("");
    setUpdateNotes("");
    setUpdateExpiresAt("");
    setUpdateError(null);
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedId) return;
    if (!updateStatus) {
      const message = "Status is required";
      setUpdateError(message);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      return;
    }

    const payload: AdminAccessRequestUpdatePayload = {
      status: updateStatus,
      admin_notes: updateNotes || undefined,
      expires_at: updateExpiresAt
        ? new Date(updateExpiresAt).toISOString()
        : null,
    };

    try {
      setUpdateSaving(true);
      setUpdateError(null);

      const updated = await adminApiClient.updateAccessRequest(
        selectedId,
        payload,
      );

      setRequests((prev) => {
        const nextList = prev.map((request) => {
          if (request.id !== selectedId) return request;
          if (updated && typeof updated === "object" && "id" in updated) {
            return updated as AdminAccessRequest;
          }
          return {
            ...request,
            status: updateStatus,
            admin_notes: payload.admin_notes,
            expires_at: payload.expires_at,
          };
        });

        if (statusFilter && updateStatus !== statusFilter) {
          return nextList.filter((request) => request.id !== selectedId);
        }

        return nextList;
      });

      cancelEdit();
      showToast({
        variant: "success",
        title: "Access request updated",
        description: "The access request has been updated.",
      });
    } catch (err) {
      let message = "Unable to update access request";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setUpdateError(message);
      showToast({
        variant: "error",
        title: "Unable to update access request",
        description: message,
      });
    } finally {
      setUpdateSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Access requests</h1>
        <p className="text-sm text-slate-600">
          Review investor access requests and control their status and expiry.
        </p>
      </div>

      <Card className="space-y-4">
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleApplyFilter}>
          <div className="w-full max-w-xs">
            <div className="flex flex-col gap-1 text-sm">
              <label className="text-sm font-medium text-slate-800">
                Status filter (optional)
              </label>
              <select
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
          <Button type="submit" size="sm">
            Apply filter
          </Button>
        </form>

        {error && <Alert variant="error">{error}</Alert>}

        {loading ? (
          <DataTable
            columns={[
              "ID",
              "Email",
              "Name",
              "Company",
              "Status",
              "Requested",
              "Expires",
              "Actions",
            ]}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-3 py-2">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                </td>
                <td className="px-3 py-2">
                  <div className="h-3 w-28 rounded bg-slate-200" />
                </td>
                <td className="px-3 py-2">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-3 py-2">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-3 py-2">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                </td>
                <td className="px-3 py-2">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-3 py-2">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-3 py-2">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                </td>
              </tr>
            ))}
          </DataTable>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/5 text-xs font-semibold text-brand-red">
              AR
            </div>
            <p className="text-sm font-medium text-slate-900">No access requests yet</p>
            <p className="text-xs text-slate-600">
              New investor access requests will appear here as they are submitted.
            </p>
          </div>
        ) : (
          <DataTable
            columns={[
              "ID",
              "Email",
              "Name",
              "Company",
              "Status",
              "Requested",
              "Expires",
              "Actions",
            ]}
          >
            {requests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                    <td className="px-3 py-2 text-[11px] font-mono text-slate-700">
                      {request.id}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-800">
                      {request.email ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-800">
                      {request.full_name ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-800">
                      {request.company ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {(() => {
                        const rawStatus =
                          typeof request.status === "string"
                            ? request.status
                            : "";
                        const status = rawStatus || "Unknown";
                        const normalized = rawStatus.toLowerCase();
                        let variant:
                          | "default"
                          | "success"
                          | "danger"
                          | "warning"
                          | "muted" = "default";

                        if (normalized === "approved") {
                          variant = "success";
                        } else if (
                          normalized === "denied" ||
                          normalized === "rejected"
                        ) {
                          variant = "danger";
                        } else if (normalized === "pending") {
                          variant = "warning";
                        } else if (!rawStatus) {
                          variant = "muted";
                        }

                        return (
                          <StatusBadge variant={variant}>{status}</StatusBadge>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">
                      {request.requested_at
                        ? new Date(request.requested_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500">
                      {request.expires_at
                        ? new Date(request.expires_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(request)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
          </DataTable>
        )}
      </Card>

      <Modal
        open={!!selectedId}
        title="Update access request"
        description="Adjust the status, internal notes, and expiry for this investor request."
        onClose={cancelEdit}
        size="md"
      >
        <form className="space-y-3" onSubmit={handleUpdate}>
          <div className="flex flex-col gap-1 text-sm">
            <label className="text-sm font-medium text-slate-800">
              Status
            </label>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
              value={updateStatus}
              onChange={(event) => setUpdateStatus(event.target.value)}
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              {updateStatus &&
                !["pending", "approved", "denied"].includes(updateStatus) && (
                  <option value={updateStatus}>
                    Custom: {updateStatus}
                  </option>
                )}
            </select>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <label className="text-sm font-medium text-slate-800">
              Admin notes
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
              value={updateNotes}
              onChange={(event) => setUpdateNotes(event.target.value)}
              placeholder="Internal notes about this request (optional)"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <label className="text-sm font-medium text-slate-800">
              Expires at (optional)
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
              value={updateExpiresAt}
              onChange={(event) => setUpdateExpiresAt(event.target.value)}
            />
          </div>

          {updateError && <Alert variant="error">{updateError}</Alert>}

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={updateSaving}
            >
              {updateSaving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
