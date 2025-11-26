"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCategories, useDocumentDownload } from "@/hooks/useDocuments";
import { apiClient, APIClientError } from "@/lib/api-client";
import type { DocumentResponse } from "@/lib/api-types";

export default function DemoDocumentsPage() {
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { downloadDocument, downloading, error: downloadError } = useDocumentDownload();

  const [documentsByCategory, setDocumentsByCategory] = useState<Record<string, DocumentResponse[]>>({});
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllDocuments = async () => {
      if (!categories.length) {
        setDocumentsByCategory({});
        return;
      }

      try {
        setDocumentsLoading(true);
        setDocumentsError(null);

        const entries = await Promise.all(
          categories.map(async (cat) => {
            try {
              const response = await fetch(`/api/documents/category/${cat.id}/documents`);

              if (!response.ok) {
                throw new APIClientError(
                  `Failed to fetch documents for category ${cat.id} (HTTP ${response.status})`,
                  response.status
                );
              }

              const docs = (await response.json()) as DocumentResponse[];
              return { id: cat.id, docs };
            } catch (err) {
              console.error("Failed to fetch documents for category", cat.id, err);
              return { id: cat.id, docs: [] as DocumentResponse[] };
            }
          })
        );

        const map: Record<string, DocumentResponse[]> = {};
        for (const entry of entries) {
          map[entry.id] = entry.docs;
        }
        setDocumentsByCategory(map);
      } catch (err) {
        const message = err instanceof APIClientError ? err.message : "Failed to load documents.";
        setDocumentsError(message);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchAllDocuments();
  }, [categories]);

  const totalDocuments = Object.values(documentsByCategory).reduce(
    (sum, docs) => sum + docs.length,
    0
  );

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory =
    categories.length === 0
      ? null
      : categories.find((cat) => cat.id === selectedCategoryId) || categories[0];

  const selectedDocs = selectedCategory ? documentsByCategory[selectedCategory.id] || [] : [];

  const handlePreview = async (doc: DocumentResponse) => {
    try {
      setPreviewDoc(doc);
      setPreviewOpen(true);
      setPreviewLoading(true);
      setPreviewError(null);

      const response = await fetch(`/api/documents/${doc.id}/view`);

      if (!response.ok) {
        throw new APIClientError(`Failed to load document preview (HTTP ${response.status})`, response.status);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      const message = err instanceof APIClientError ? err.message : "Failed to load document preview.";
      setPreviewError(message);
      console.error("View failed:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewOpen(false);
    setPreviewDoc(null);
    setPreviewError(null);
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatUpdatedAt = (iso?: string | null) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return "";
    }
  };

  const categoryIconPath = "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="SAYeTECH"
              className="h-10 w-auto"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
                SAYeTECH
              </p>
              <p className="text-xs text-slate-600">Investor Data Room</p>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-brand-red transition">
              Dashboard
            </Link>
            <Link href="/documents" className="rounded-lg bg-brand-red px-4 py-2 text-sm font-medium text-white shadow-md">
              Documents
            </Link>
            <Link href="/nda" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-brand-red transition">
              NDA
            </Link>
            <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              Exit Data Room
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-brand-red/5 -mr-12 -mt-12" />
              <div className="relative">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">Categories</h2>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        selectedCategory && selectedCategory.id === cat.id
                          ? "bg-brand-red text-white font-semibold shadow-md"
                          : "text-slate-700 hover:bg-red-100/50 hover:text-brand-red"
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryIconPath} />
                      </svg>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Card className="p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quick Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Documents</span>
                  <span className="font-semibold text-slate-900">{totalDocuments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Updated</span>
                  <span className="font-semibold text-slate-900">1 day ago</span>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {selectedCategory?.name || "Documents"}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedCategory
                    ? `${selectedDocs.length} document${selectedDocs.length === 1 ? "" : "s"} in this category`
                    : `${totalDocuments} documents across ${categories.length} categories`}
                </p>
              </div>
              <input
                placeholder="Search documents..."
                className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus-visible:border-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
              />
            </div>
            {categoriesError && (
              <p className="text-sm text-red-600">{categoriesError}</p>
            )}

            <div className="space-y-6">
              {documentsError && (
                <p className="text-sm text-red-600">{documentsError}</p>
              )}
              {documentsLoading && !totalDocuments && (
                <p className="text-sm text-slate-500">Loading documents...</p>
              )}

              {selectedCategory && selectedDocs.length > 0 && (
                <Card key={selectedCategory.id} className="overflow-hidden border-red-100">
                  <div className="flex items-center justify-between border-b border-red-50 bg-red-50/60 px-4 py-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">{selectedCategory.name}</h2>
                      <p className="text-xs text-slate-500">
                        {selectedDocs.length} document{selectedDocs.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-red-100 text-sm">
                      <thead className="bg-red-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-2 text-left">Document</th>
                          <th className="px-4 py-2 text-left hidden sm:table-cell">Size</th>
                          <th className="px-4 py-2 text-left hidden md:table-cell">Updated</th>
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-50 bg-white">
                        {selectedDocs.map((doc) => (
                          <tr key={doc.id} className="hover:bg-red-50/60">
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-slate-900">{doc.title}</span>
                                  {doc.version_number && (
                                    <span className="rounded-full bg-brand-red/10 px-2.5 py-0.5 text-xs font-semibold text-brand-red">
                                      v{doc.version_number}
                                    </span>
                                  )}
                                </div>
                                {doc.description && (
                                  <p className="text-xs text-slate-600">{doc.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-slate-600 hidden sm:table-cell">
                              {formatFileSize(doc.file_size)}
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-slate-600 hidden md:table-cell">
                              {formatUpdatedAt(doc.updated_at)}
                            </td>
                            <td className="px-4 py-3 align-top text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-white hover:text-brand-red hover:border-brand-red disabled:opacity-50"
                                  onClick={() => handlePreview(doc)}
                                  disabled={previewLoading && previewDoc?.id === doc.id}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button
                                  className="rounded-lg bg-brand-red p-2 text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
                                  onClick={() => downloadDocument(doc.id, doc.file_name || `${doc.title}.pdf`)}
                                  disabled={downloading}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {selectedCategory && !documentsLoading && selectedDocs.length === 0 && (
                <p className="text-sm text-slate-500">No documents available in this category yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Document preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {previewDoc?.title || "Document preview"}
                </h2>
                {previewDoc?.file_name && (
                  <p className="text-xs text-slate-500">{previewDoc.file_name}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClosePreview}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close preview"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-50">
              {previewLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-red" />
                    <p className="text-xs text-slate-500">Loading document...</p>
                  </div>
                </div>
              ) : previewError ? (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-red-600">
                  {previewError}
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="h-full w-full"
                  title={previewDoc?.title || "Document"}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
                  No preview available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
