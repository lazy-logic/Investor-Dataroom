"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { adminApiClient, AdminDocument } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface AccessLogRow {
  user_email?: string;
  email?: string;
  user_id?: string;
  user?: string;
  action?: string;
  event?: string;
  ip_address?: string;
  ip?: string;
  client_ip?: string;
  user_agent?: string;
  created_at?: string;
  timestamp?: string;
  accessed_at?: string;
  document_id?: string;
  document_title?: string;
  [key: string]: unknown;
}

type ActionFilter = "all" | "view" | "download";

function AdminActivityContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("document") || "";
  
  const [documentId, setDocumentId] = useState(initialDocId);
  const [limit, setLimit] = useState("100");
  const [logs, setLogs] = useState<AccessLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  
  // Documents for quick selection
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [selectedDocTitle, setSelectedDocTitle] = useState<string>("");
  
  const { showToast } = useToast();

  // Load documents on mount
  useEffect(() => {
    const loadDocs = async () => {
      try {
        setDocsLoading(true);
        const docs = await adminApiClient.listDocuments();
        setDocuments(docs);
        
        // If we have an initial document ID, find its title
        if (initialDocId) {
          const doc = docs.find(d => d.id === initialDocId);
          if (doc) {
            setSelectedDocTitle(doc.title || "");
          }
        }
      } catch {
        // Silently fail - documents dropdown is optional
      } finally {
        setDocsLoading(false);
      }
    };
    void loadDocs();
  }, [initialDocId]);

  // Auto-load logs if document ID is provided via URL
  useEffect(() => {
    if (initialDocId) {
      void loadLogs(initialDocId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDocId]);

  const loadLogs = async (docId: string) => {
    if (!docId) {
      setError("Please select or enter a document ID");
      return;
    }

    const parsedLimit = Number(limit) || 100;

    try {
      setLoading(true);
      setError(null);
      const data = (await adminApiClient.getDocumentAccessLogs(
        docId,
        parsedLimit,
      )) as AccessLogRow[];
      setLogs(Array.isArray(data) ? data : []);
      
      // Update selected doc title
      const doc = documents.find(d => d.id === docId);
      setSelectedDocTitle(doc?.title || "");
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

  const handleLoadLogs = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadLogs(documentId);
  };

  const handleDocumentSelect = (docId: string) => {
    setDocumentId(docId);
    void loadLogs(docId);
  };

  const getValue = (row: AccessLogRow, keys: string[]): string => {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === "string" || typeof value === "number") {
        return String(value);
      }
    }
    return "—";
  };

  const formatDate = (row: AccessLogRow): string => {
    const keys = ["created_at", "timestamp", "accessed_at"];
    for (const key of keys) {
      const raw = row[key];
      if (typeof raw === "string") {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }
    }
    return "—";
  };

  const getActionBadge = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes("download")) {
      return "bg-purple-100 text-purple-700";
    }
    if (lowerAction.includes("view")) {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  const getActionIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes("download")) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  };

  // Filter logs by action
  const filteredLogs = logs.filter((log) => {
    if (actionFilter === "all") return true;
    const action = getValue(log, ["action", "event"]).toLowerCase();
    if (actionFilter === "download") return action.includes("download");
    if (actionFilter === "view") return action.includes("view");
    return true;
  });

  // Stats
  const viewCount = logs.filter(l => getValue(l, ["action", "event"]).toLowerCase().includes("view")).length;
  const downloadCount = logs.filter(l => getValue(l, ["action", "event"]).toLowerCase().includes("download")).length;
  const uniqueUsers = new Set(logs.map(l => getValue(l, ["user_email", "email", "user_id", "user"]))).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Document Activity</h1>
          <p className="text-sm text-slate-600 mt-1">
            Track document views, downloads, and investor engagement.
          </p>
        </div>
        <Link href="/admin/documents">
          <Button variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Back to Documents
          </Button>
        </Link>
      </div>

      {/* Document Selection */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Select Document</h2>
        
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleLoadLogs}>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Document</label>
            <select
              value={documentId}
              onChange={(e) => handleDocumentSelect(e.target.value)}
              disabled={docsLoading}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-white"
            >
              <option value="">Select a document...</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title || doc.id} {doc.categories?.[0] ? `(${doc.categories[0]})` : ""}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-slate-400 self-center">or</div>
          
          <div className="w-64">
            <Input
              label="Document ID"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="Enter document ID"
            />
          </div>
          
          <div className="w-24">
            <Input
              label="Limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="100"
            />
          </div>
          
          <Button type="submit" disabled={loading || !documentId}>
            {loading ? "Loading..." : "Load Activity"}
          </Button>
        </form>

        {error && <Alert variant="error">{error}</Alert>}
      </Card>

      {/* Activity Stats & Logs */}
      {logs.length > 0 && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{logs.length}</div>
                <div className="text-xs text-slate-500">Total Events</div>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{viewCount}</div>
                <div className="text-xs text-slate-500">Views</div>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{downloadCount}</div>
                <div className="text-xs text-slate-500">Downloads</div>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{uniqueUsers}</div>
                <div className="text-xs text-slate-500">Unique Users</div>
              </div>
            </Card>
          </div>

          {/* Activity Log */}
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Activity Log {selectedDocTitle && <span className="text-slate-500">— {selectedDocTitle}</span>}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredLogs.length} of {logs.length} events
                </p>
              </div>
              
              {/* Action Filter */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setActionFilter("all")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    actionFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActionFilter("view")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    actionFilter === "view" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Views
                </button>
                <button
                  type="button"
                  onClick={() => setActionFilter("download")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    actionFilter === "download" ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Downloads
                </button>
              </div>
            </div>

            {/* Activity Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">User</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">Action</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">IP Address</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">User Agent</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log, index) => {
                    const user = getValue(log, ["user_email", "email", "user_id", "user"]);
                    const action = getValue(log, ["action", "event"]);
                    const ip = getValue(log, ["ip_address", "ip", "client_ip"]);
                    const userAgent = getValue(log, ["user_agent"]);
                    const time = formatDate(log);

                    return (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                              {user.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-900 font-medium">{user}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(action)}`}>
                            {getActionIcon(action)}
                            {action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{ip}</code>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 truncate max-w-[200px] block" title={userAgent}>
                            {userAgent.length > 40 ? userAgent.substring(0, 40) + "..." : userAgent}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!loading && logs.length === 0 && documentId && !error && (
        <Card className="py-16 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">No activity yet</h3>
            <p className="text-sm text-slate-600">
              Once investors start viewing or downloading this document, their activity will appear here.
            </p>
          </div>
        </Card>
      )}

      {/* Initial State */}
      {!loading && logs.length === 0 && !documentId && !error && (
        <Card className="py-16 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-red/10">
              <svg className="h-8 w-8 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Track Document Activity</h3>
            <p className="text-sm text-slate-600">
              Select a document above to view detailed activity logs including views, downloads, IP addresses, and timestamps.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function AdminActivityPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      </div>
    }>
      <AdminActivityContent />
    </Suspense>
  );
}
