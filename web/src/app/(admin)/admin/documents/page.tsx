"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { adminApiClient, AdminDocument, AdminUser } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

type CategoryStat = {
  category: string;
  count: number;
};

type SortBy = "name" | "uploaded_at";
type SortDirection = "asc" | "desc";

export default function AdminDocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [categoriesText, setCategoriesText] = useState("");
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<AdminDocument | null>(null);

  const [deleteId, setDeleteId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState("");
  const [filterTags, setFilterTags] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [categoryOptionsLoading, setCategoryOptionsLoading] = useState(false);
  const [categoryOptionsError, setCategoryOptionsError] = useState<string | null>(
    null,
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterSelectedCategories, setFilterSelectedCategories] = useState<string[]>(
    [],
  );
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const defaultCategories: string[] = [
    "Company Overview",
    "Market & Impact",
    "Financials",
    "IP & Technology",
    "Traction",
    "Legal",
  ];

  const availableCategories =
    categoryOptions.length > 0 ? categoryOptions : defaultCategories;

  const sortedDocuments = [...documents].sort((a, b) => {
    if (sortBy === "uploaded_at") {
      const aTime =
        a.uploaded_at && typeof a.uploaded_at === "string"
          ? new Date(a.uploaded_at).getTime()
          : 0;
      const bTime =
        b.uploaded_at && typeof b.uploaded_at === "string"
          ? new Date(b.uploaded_at).getTime()
          : 0;

      if (aTime < bTime) return sortDirection === "asc" ? -1 : 1;
      if (aTime > bTime) return sortDirection === "asc" ? 1 : -1;
    } else {
      const aTitle = (a.title || a.id || "").toLowerCase();
      const bTitle = (b.title || b.id || "").toLowerCase();

      if (aTitle < bTitle) return sortDirection === "asc" ? -1 : 1;
      if (aTitle > bTitle) return sortDirection === "asc" ? 1 : -1;
    }

    const aId = (a.id || "").toLowerCase();
    const bId = (b.id || "").toLowerCase();
    if (aId < bId) return -1;
    if (aId > bId) return 1;
    return 0;
  });

  const groupedDocuments = sortedDocuments.reduce((groups, doc) => {
    const docCategories = Array.isArray(doc.categories) ? doc.categories : [];
    const primaryCategory = docCategories[0] || "Uncategorized";
    if (!groups[primaryCategory]) {
      groups[primaryCategory] = [];
    }
    groups[primaryCategory].push(doc);
    return groups;
  }, {} as Record<string, AdminDocument[]>);

  const categoryGroupNames = Object.keys(groupedDocuments).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [detailId, setDetailId] = useState("");
  const [detail, setDetail] = useState<AdminDocument | null>(null);
  const [detailUrl, setDetailUrl] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [confirmingDeleteDocument, setConfirmingDeleteDocument] =
    useState<AdminDocument | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoryOptionsLoading(true);
        setCategoryOptionsError(null);
        const data = await adminApiClient.listDocumentCategories();
        if (Array.isArray(data)) {
          setCategoryOptions(data);
        } else {
          setCategoryOptions([]);
        }
      } catch (err) {
        let message = "Unable to load document categories";
        if (err instanceof APIClientError) {
          message = err.message || message;
        }
        setCategoryOptionsError(message);
        showToast({
          variant: "error",
          title: "Unable to load document categories",
          description: message,
        });
      } finally {
        setCategoryOptionsLoading(false);
      }
    };

    void loadCategories();
  }, [showToast]);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      const message = "Please select a file to upload";
      setUploadError(message);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      setUploadSuccess(null);
      return;
    }

    const categories = categoriesText
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (categories.length === 0) {
      const message = "At least one category is required";
      setUploadError(message);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      setUploadSuccess(null);
      return;
    }

    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("categories", categories.join(","));
    if (description) {
      formData.append("description", description);
    }
    if (tags.length > 0) {
      formData.append("tags", tags.join(","));
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      setUploadedDocument(null);

      const document = await adminApiClient.uploadDocument(formData);

      setUploadedDocument(document);
      const message = "Document uploaded successfully";
      setUploadSuccess(message);
      setFile(null);
      setCategoriesText("");
      setDescription("");
      setTagsText("");
      setUploadModalOpen(false);
      showToast({
        variant: "success",
        title: "Document uploaded",
        description: message,
      });
    } catch (err) {
      let message = "Unable to upload document";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setUploadError(message);
      showToast({
        variant: "error",
        title: "Unable to upload document",
        description: message,
      });
      setUploadSuccess(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!deleteId) {
      const message = "Document ID is required";
      setDeleteError(message);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      setDeleteSuccess(null);
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      setDeleteSuccess(null);

      await adminApiClient.deleteDocument(deleteId);

      const message = "Document deleted successfully (if it existed)";
      setDeleteSuccess(message);
      setDeleteId("");
      showToast({
        variant: "success",
        title: "Document deleted",
        description: message,
      });
    } catch (err) {
      let message = "Unable to delete document";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setDeleteError(message);
      showToast({
        variant: "error",
        title: "Unable to delete document",
        description: message,
      });
      setDeleteSuccess(null);
    } finally {
      setDeleting(false);
    }
  };

  const loadDocumentsWithFilters = async (overrideCategories?: string) => {
    try {
      setDocsLoading(true);
      setDocsError(null);

      const params: { categories?: string; tags?: string; search?: string } = {};
      const categoriesValue =
        overrideCategories !== undefined
          ? overrideCategories
          : filterCategories.trim();

      if (categoriesValue) params.categories = categoriesValue;
      if (filterTags.trim()) params.tags = filterTags.trim();
      if (filterSearch.trim()) params.search = filterSearch.trim();

      const hasParams = Object.keys(params).length > 0;
      const data = await adminApiClient.listDocuments(hasParams ? params : undefined);
      setDocuments(data);
    } catch (err) {
      let message = "Unable to load documents";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setDocsError(message);
      setDocuments([]);
      showToast({
        variant: "error",
        title: "Unable to load documents",
        description: message,
      });
    } finally {
      setDocsLoading(false);
    }
  };

  const handleLoadDocuments = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadDocumentsWithFilters();
  };

  useEffect(() => {
    const loadOnMount = async () => {
      try {
        setDocsLoading(true);
        setDocsError(null);

        const data = await adminApiClient.listDocuments();
        setDocuments(data);
      } catch (err) {
        let message = "Unable to load documents";
        if (err instanceof APIClientError) {
          message = err.message || message;
        }
        setDocsError(message);
        setDocuments([]);
        showToast({
          variant: "error",
          title: "Unable to load documents",
          description: message,
        });
      } finally {
        setDocsLoading(false);
      }
    };

    void loadOnMount();
  }, [showToast]);

  const handleLoadCategoryStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const raw = await adminApiClient.getDocumentCategoryStats();

      let normalized: CategoryStat[] = [];

      if (Array.isArray(raw)) {
        normalized = raw
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const anyItem = item as { category?: unknown; count?: unknown };
            const categoryValue = anyItem.category;
            const category =
              typeof categoryValue === "string"
                ? categoryValue
                : categoryValue !== undefined && categoryValue !== null
                ? String(categoryValue)
                : "";
            const countValue = anyItem.count;
            const numericCount =
              typeof countValue === "number"
                ? countValue
                : countValue !== undefined && countValue !== null
                ? Number(countValue)
                : 0;
            if (!category) return null;
            return {
              category,
              count: Number.isNaN(numericCount) ? 0 : numericCount,
            };
          })
          .filter((value) => value !== null) as CategoryStat[];
      } else if (raw && typeof raw === "object") {
        const record = raw as Record<string, unknown>;
        normalized = Object.entries(record).map(([key, value]) => {
          const numericCount =
            typeof value === "number" ? value : Number(value ?? 0);
          return {
            category: key,
            count: Number.isNaN(numericCount) ? 0 : numericCount,
          };
        });
      }

      setCategoryStats(normalized);
    } catch (err) {
      let message = "Unable to load category stats";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setStatsError(message);
      setCategoryStats([]);
      showToast({
        variant: "error",
        title: "Unable to load category stats",
        description: message,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLoadDetails = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!detailId) {
      const message = "Document ID is required";
      setDetailError(message);
      setDetail(null);
      setDetailUrl(null);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError(null);
      setDetail(null);
      setDetailUrl(null);

      const doc = await adminApiClient.getDocument(detailId);

      let resolvedUrl: string | null = null;
      try {
        const urlResponse = (await adminApiClient.getDocumentUrl(
          detailId,
        )) as { url?: string };
        if (urlResponse && typeof urlResponse.url === "string") {
          resolvedUrl = urlResponse.url;
        }
      } catch {
        // If URL endpoint fails, we still show the document details.
      }

      if (!resolvedUrl && typeof doc.file_url === "string") {
        resolvedUrl = doc.file_url;
      }

      let uploadedByDisplay = doc.uploaded_by;
      if (doc.uploaded_by && typeof doc.uploaded_by === "string") {
        try {
          const uploader = (await adminApiClient.getUser(
            doc.uploaded_by,
          )) as AdminUser;
          const name = (uploader.full_name || "").toString().trim();
          if (name) {
            uploadedByDisplay = name;
          } else if (uploader.email) {
            uploadedByDisplay = uploader.email;
          }
        } catch {
          // If uploader lookup fails, fall back to raw id.
        }
      }

      setDetail({
        ...doc,
        uploaded_by: uploadedByDisplay,
      });
      setDetailUrl(resolvedUrl);
    } catch (err) {
      let message = "Unable to load document details";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setDetailError(message);
      setDetail(null);
      setDetailUrl(null);
      showToast({
        variant: "error",
        title: "Unable to load document details",
        description: message,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleQuickView = async (documentId: string) => {
    try {
      setDetailId(documentId);
      setDetailLoading(true);
      setDetailError(null);
      setDetail(null);
      setDetailUrl(null);

      const doc = await adminApiClient.getDocument(documentId);

      let resolvedUrl: string | null = null;
      try {
        const urlResponse = (await adminApiClient.getDocumentUrl(
          documentId,
        )) as { url?: string };
        if (urlResponse && typeof urlResponse.url === "string") {
          resolvedUrl = urlResponse.url;
        }
      } catch {
        // If URL endpoint fails, we still show the document details.
      }

      if (!resolvedUrl && typeof doc.file_url === "string") {
        resolvedUrl = doc.file_url;
      }

      let uploadedByDisplay = doc.uploaded_by;
      if (doc.uploaded_by && typeof doc.uploaded_by === "string") {
        try {
          const uploader = (await adminApiClient.getUser(
            doc.uploaded_by,
          )) as AdminUser;
          const name = (uploader.full_name || "").toString().trim();
          if (name) {
            uploadedByDisplay = name;
          } else if (uploader.email) {
            uploadedByDisplay = uploader.email;
          }
        } catch {
          // If uploader lookup fails, fall back to raw id.
        }
      }

      setDetail({
        ...doc,
        uploaded_by: uploadedByDisplay,
      });
      setDetailUrl(resolvedUrl);
    } catch (err) {
      let message = "Unable to load document details";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setDetailError(message);
      setDetail(null);
      setDetailUrl(null);
      showToast({
        variant: "error",
        title: "Unable to load document details",
        description: message,
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const openRowDeleteConfirm = (doc: AdminDocument) => {
    setConfirmingDeleteDocument(doc);
    setDeleteError(null);
    setDeleteSuccess(null);
    setDeleteId(doc.id);
  };

  const handleConfirmRowDelete = async () => {
    if (!confirmingDeleteDocument) return;

    const id = confirmingDeleteDocument.id;

    try {
      setDeleting(true);
      setDeleteError(null);
      setDeleteSuccess(null);

      await adminApiClient.deleteDocument(id);

      const message = "Document deleted successfully (if it existed)";
      setDeleteSuccess(message);
      setDeleteId((current) => (current === id ? "" : current));
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      showToast({
        variant: "success",
        title: "Document deleted",
        description: message,
      });
    } catch (err) {
      let message = "Unable to delete document";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setDeleteError(message);
      showToast({
        variant: "error",
        title: "Unable to delete document",
        description: message,
      });
      setDeleteSuccess(null);
    } finally {
      setDeleting(false);
      setConfirmingDeleteDocument(null);
    }
  };

  const handleCancelRowDelete = () => {
    if (deleting) return;
    setConfirmingDeleteDocument(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
            <p className="text-sm text-slate-600">
              Manage all documents in the investor data room: organize by category,
              review details, and control access.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
          >
            Add document
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
          <div className="space-y-4 lg:col-span-2">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-medium text-slate-800">
                    Documents gallery
                  </h2>
                  <p className="text-xs text-slate-600">
                    Browse all documents and filter by category, tags, or search.
                  </p>
                </div>
                {documents.length > 0 && !docsLoading && (
                  <div className="inline-flex items-center gap-3 rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
                    <span className="font-medium text-slate-800">
                      {documents.length} documents
                    </span>
                  </div>
                )}
              </div>
              <form className="space-y-2" onSubmit={handleLoadDocuments}>
                <div className="flex flex-col gap-1 text-sm">
                  <label className="text-sm font-medium text-slate-800">
                    Categories
                  </label>
                  {categoryOptionsLoading ? (
                    <p className="text-xs text-slate-500">Loading categories...</p>
                  ) : availableCategories.length === 0 ? (
                    <p className="text-xs text-slate-500">No categories available.</p>
                  ) : (
                    <select
                      multiple
                      value={filterSelectedCategories}
                      onChange={(event) => {
                        const selected = Array.from(
                          event.currentTarget.selectedOptions,
                        ).map((option) => option.value);
                        setFilterSelectedCategories(selected);
                        setFilterCategories(selected.join(","));
                      }}
                      className="h-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-red focus-visible:border-brand-red"
                    >
                      {availableCategories.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Filter documents by one or more categories from the data room.
                  </p>
                </div>
                <Input
                  label="Tags filter (optional)"
                  value={filterTags}
                  onChange={(event) => setFilterTags(event.target.value)}
                  placeholder="Comma-separated tags"
                />
                <Input
                  label="Search (optional)"
                  value={filterSearch}
                  onChange={(event) => setFilterSearch(event.target.value)}
                  placeholder="Search in title and description"
                />

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-xs font-medium text-slate-800">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as SortBy)
                    }
                    className="h-7 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-red focus-visible:border-brand-red"
                  >
                    <option value="name">Name</option>
                    <option value="uploaded_at">Upload date</option>
                  </select>
                  <select
                    value={sortDirection}
                    onChange={(event) =>
                      setSortDirection(event.target.value as SortDirection)
                    }
                    className="h-7 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-red focus-visible:border-brand-red"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                {docsError && <Alert variant="error">{docsError}</Alert>}

                <Button type="submit" size="sm" disabled={docsLoading}>
                  {docsLoading ? "Loading..." : "Load documents"}
                </Button>
              </form>

              {docsLoading ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-32 rounded-lg border border-slate-200 bg-slate-50/70 animate-pulse"
                    />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/5 text-xs font-semibold text-brand-red">
                    DO
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    No documents loaded yet
                  </p>
                  <p className="text-xs text-slate-600">
                    Use the filters above and click "Load documents" to see results from
                    the backend.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {categoryGroupNames.map((categoryName) => {
                    const docsInCategory = groupedDocuments[categoryName] ?? [];
                    return (
                      <div key={categoryName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {categoryName}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            {docsInCategory.length} documents
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {docsInCategory.map((doc) => (
                            <div
                              key={doc.id}
                              className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm transition hover:border-brand-red/40 hover:shadow-md"
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="font-medium text-slate-900 line-clamp-2">
                                    {doc.title || doc.id}
                                  </div>
                                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                                    {doc.file_type || "raw"}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600">
                                  {Array.isArray(doc.categories) &&
                                  doc.categories.length > 0
                                    ? doc.categories.join(", ")
                                    : "Uncategorized"}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                                  {typeof doc.file_size === "number" && (
                                    <span>{doc.file_size} bytes</span>
                                  )}
                                  {doc.uploaded_at && (
                                    <span>
                                      · {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    void handleQuickView(doc.id);
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  disabled={
                                    deleting &&
                                    confirmingDeleteDocument?.id === doc.id
                                  }
                                  onClick={() => openRowDeleteConfirm(doc)}
                                >
                                  {deleting && confirmingDeleteDocument?.id === doc.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="space-y-4">
              <h2 className="text-sm font-medium text-slate-800">Document details</h2>
              <form className="space-y-3" onSubmit={handleLoadDetails}>
                <Input
                  label="Document ID"
                  value={detailId}
                  onChange={(event) => setDetailId(event.target.value)}
                  placeholder="Document identifier from backend"
                />

                {detailError && <Alert variant="error">{detailError}</Alert>}

                <Button type="submit" size="sm" disabled={detailLoading}>
                  {detailLoading ? "Loading..." : "Load details"}
                </Button>
              </form>

              {detail ? (
                <div className="mt-2 space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  <div>
                    <span className="font-semibold">ID:</span> {detail.id}
                  </div>
                  {detail.title && (
                    <div>
                      <span className="font-semibold">Title:</span> {detail.title}
                    </div>
                  )}
                  {Array.isArray(detail.categories) &&
                  detail.categories.length > 0 && (
                    <div>
                      <span className="font-semibold">Categories:</span>{" "}
                      {detail.categories.join(", ")}
                    </div>
                  )}
                  {detail.description && (
                    <div>
                      <span className="font-semibold">Description:</span>{" "}
                      {String(detail.description)}
                    </div>
                  )}
                  {Array.isArray(detail.tags) && detail.tags.length > 0 && (
                    <div>
                      <span className="font-semibold">Tags:</span>{" "}
                      {detail.tags.join(", ")}
                    </div>
                  )}
                  {detail.file_type && (
                    <div>
                      <span className="font-semibold">Type:</span> {detail.file_type}
                    </div>
                  )}
                  {typeof detail.file_size === "number" && (
                    <div>
                      <span className="font-semibold">Size:</span>{" "}
                      {detail.file_size} bytes
                    </div>
                  )}
                  {detail.uploaded_by && (
                    <div>
                      <span className="font-semibold">Uploaded by:</span>{" "}
                      {detail.uploaded_by}
                    </div>
                  )}
                  {detail.uploaded_at && (
                    <div>
                      <span className="font-semibold">Uploaded:</span>{" "}
                      {new Date(detail.uploaded_at).toLocaleString()}
                    </div>
                  )}
                  {detailUrl && (
                    <div>
                      <span className="font-semibold">Download URL:</span>{" "}
                      <a
                        href={detailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-[11px] text-brand-red underline"
                      >
                        {detailUrl}
                      </a>
                    </div>
                  )}
                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <Link href={`/admin/activity?document=${detail.id}`}>
                      <Button type="button" size="sm" variant="secondary" className="w-full">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View Activity
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Select a document from the gallery or enter an ID above to view its
                  full details.
                </p>
              )}
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-slate-800">Category stats</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => void handleLoadCategoryStats()}
                  disabled={statsLoading}
                >
                  {statsLoading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
              <p className="text-xs text-slate-600">
                Document counts per category from the backend.
              </p>

              {statsError && <Alert variant="error">{statsError}</Alert>}

              {categoryStats.length > 0 ? (
                <ul className="space-y-1 text-xs text-slate-700">
                  {categoryStats.map((stat) => {
                    const isActive = filterSelectedCategories.includes(stat.category);
                    return (
                      <li key={stat.category}>
                        <button
                          type="button"
                          onClick={() => {
                            const value = stat.category;
                            setFilterSelectedCategories([value]);
                            setFilterCategories(value);
                            void loadDocumentsWithFilters(value);
                          }}
                          className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-slate-700 transition border ${
                            isActive
                              ? "border-brand-red/60 bg-brand-red/5 text-brand-red"
                              : "border-transparent bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <span>{stat.category}</span>
                          <span className="font-mono text-[11px]">
                            {stat.count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">
                  No category stats loaded yet.
                </p>
              )}
            </Card>

            <Card className="space-y-4">
              <h2 className="text-sm font-medium text-slate-800">
                Delete by ID (advanced)
              </h2>
              <p className="text-xs text-slate-600">
                Use this only if you have a specific document identifier from logs or
                support. For most cases, delete directly from the gallery above.
              </p>
              <form className="space-y-3" onSubmit={handleDelete}>
                <Input
                  label="Document ID"
                  value={deleteId}
                  onChange={(event) => setDeleteId(event.target.value)}
                  placeholder="Document identifier from backend"
                />

                {deleteError && <Alert variant="error">{deleteError}</Alert>}
                {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}

                <Button type="submit" variant="ghost" size="sm" disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete document"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmingDeleteDocument}
        title="Delete document?"
        description={
          confirmingDeleteDocument ? (
            <span>
              This will permanently delete{" "}
              <span className="font-mono text-slate-900">
                {confirmingDeleteDocument.title || confirmingDeleteDocument.id}
              </span>
              {" "}
              from the data room.
            </span>
          ) : null
        }
        confirmLabel={
          confirmingDeleteDocument && deleting ? "Deleting..." : "Delete"
        }
        cancelLabel="Cancel"
        loading={!!(confirmingDeleteDocument && deleting)}
        onConfirm={() => {
          void handleConfirmRowDelete();
        }}
        onCancel={handleCancelRowDelete}
      />
      <Modal
        open={uploadModalOpen}
        title="Add document"
        description="Upload a new document to the data room."
        onClose={() => setUploadModalOpen(false)}
        size="md"
      >
        <form className="space-y-3" onSubmit={handleUpload}>
          <div className="flex flex-col gap-1 text-sm">
            <label className="text-sm font-medium text-slate-800">File</label>
            <input
              type="file"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <label className="text-sm font-medium text-slate-800">Categories</label>
            {categoryOptionsError && (
              <p className="text-xs text-red-600">{categoryOptionsError}</p>
            )}
            {categoryOptionsLoading ? (
              <p className="text-xs text-slate-500">Loading categories...</p>
            ) : availableCategories.length === 0 ? (
              <p className="text-xs text-slate-500">
                No categories are defined yet. Configure categories in the backend
                before uploading.
              </p>
            ) : (
              <select
                value={selectedCategories[0] ?? ""}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (!value) {
                    setSelectedCategories([]);
                    setCategoriesText("");
                  } else {
                    setSelectedCategories([value]);
                    setCategoriesText(value);
                  }
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-red focus-visible:border-brand-red"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {availableCategories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-slate-500">
              Select a category defined in the data room.
            </p>
          </div>
          <Input
            label="Description (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short description for this document"
          />
          <Input
            label="Tags (optional)"
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            placeholder="Comma-separated tags, e.g. round,financials,key-doc"
          />

          {uploadError && <Alert variant="error">{uploadError}</Alert>}
          {uploadSuccess && <Alert variant="success">{uploadSuccess}</Alert>}

          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload document"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
