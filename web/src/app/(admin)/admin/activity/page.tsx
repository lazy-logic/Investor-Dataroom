"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { adminApiClient } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface AccessLogRow {
  [key: string]: unknown;
}

export default function AdminActivityPage() {
  const [documentId, setDocumentId] = useState("");
  const [limit, setLimit] = useState("50");
  const [logs, setLogs] = useState<AccessLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleLoadLogs = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!documentId) {
      const message = "Document ID is required";
      setError(message);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      setLogs([]);
      return;
    }

    const parsedLimit = Number(limit) || 50;

    try {
      setLoading(true);
      setError(null);
      const data = (await adminApiClient.getDocumentAccessLogs(
        documentId,
        parsedLimit,
      )) as AccessLogRow[];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      let message = "Unable to load access logs";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      showToast({
        variant: "error",
        title: "Unable to load access logs",
        description: message,
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (row: AccessLogRow, keys: string[]): string => {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === "string" || typeof value === "number") {
        return String(value);
      }
    }
    return "-";
  };

  const renderDateCell = (row: AccessLogRow, keys: string[]): string => {
    for (const key of keys) {
      const raw = row[key];
      if (typeof raw === "string") {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleString();
        }
        return raw;
      }
    }
    return "-";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-slate-600">
          View document access logs for auditing and investor activity.
        </p>
      </div>

      <Card className="space-y-4">
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleLoadLogs}>
          <div className="w-full max-w-xs">
            <Input
              label="Document ID"
              value={documentId}
              onChange={(event) => setDocumentId(event.target.value)}
              placeholder="Document identifier"
            />
          </div>
          <div className="w-28">
            <Input
              label="Limit"
              type="number"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              placeholder="50"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Load logs"}
          </Button>
        </form>

        {error && <Alert variant="error">{error}</Alert>}

        {loading ? (
          <DataTable
            className="mt-4 max-h-[480px] overflow-auto"
            columns={["User", "Action", "IP address", "When", "Details"]}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-2 py-1">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-2 py-1">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                </td>
                <td className="px-2 py-1">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-2 py-1">
                  <div className="h-3 w-28 rounded bg-slate-200" />
                </td>
                <td className="px-2 py-1">
                  <div className="h-3 w-40 rounded bg-slate-200" />
                </td>
              </tr>
            ))}
          </DataTable>
        ) : !loading && logs.length === 0 && !error && documentId ? (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/5 text-xs font-semibold text-brand-red">
              AL
            </div>
            <p className="text-sm font-medium text-slate-900">
              No access logs for this document
            </p>
            <p className="text-xs text-slate-600">
              Once investors start viewing or downloading this document, logs will
              appear here.
            </p>
          </div>
        ) : logs.length > 0 ? (
          <DataTable
            className="mt-4 max-h-[480px] overflow-auto"
            columns={["User", "Action", "IP address", "When", "Details"]}
          >
            {logs.map((row, index) => {
                  const user = renderCell(row, [
                    "user_email",
                    "email",
                    "user_id",
                    "user",
                  ]);
                  const action = renderCell(row, ["action", "event"]);
                  const ip = renderCell(row, ["ip_address", "ip", "client_ip"]);
                  const when = renderDateCell(row, [
                    "created_at",
                    "timestamp",
                    "accessed_at",
                  ]);

                  return (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-2 py-1 text-[11px] text-slate-800">{user}</td>
                      <td className="px-2 py-1 text-[11px] text-slate-700">{action}</td>
                      <td className="px-2 py-1 text-[11px] text-slate-700">{ip}</td>
                      <td className="px-2 py-1 text-[11px] text-slate-600">{when}</td>
                      <td className="px-2 py-1 text-[11px] text-slate-500">
                        <code className="rounded bg-slate-50 px-1 py-0.5">
                          {JSON.stringify(row)}
                        </code>
                      </td>
                    </tr>
                  );
                })}
          </DataTable>
        ) : null}
      </Card>
    </div>
  );
}
