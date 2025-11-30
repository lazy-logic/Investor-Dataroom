"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { adminApiClient } from "@/lib/admin-api-client";
import type {
  PermissionLevelResponse,
  PermissionLevelCreate,
  PermissionLevelUpdate,
} from "@/lib/api-types";
import { APIClientError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

export default function AdminPermissionsPage() {
  const [levels, setLevels] = useState<PermissionLevelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PermissionLevelCreate>({
    name: "",
    description: "",
    can_view: true,
    can_download: false,
    has_expiry: false,
    max_downloads: null,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<PermissionLevelUpdate>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [confirmingDeleteLevel, setConfirmingDeleteLevel] =
    useState<PermissionLevelResponse | null>(null);

  const loadLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiClient.listPermissionLevels();
      setLevels(data);
    } catch (err) {
      let message = "Unable to load permission levels";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      showToast({
        variant: "error",
        title: "Unable to load permission levels",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLevels();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !form.description) {
      const message = "Name and description are required";
      setCreateError(message);
      return;
    }

    const payload: PermissionLevelCreate = {
      name: form.name,
      description: form.description,
      can_view: form.can_view,
      can_download: form.can_download,
      has_expiry: form.has_expiry,
      max_downloads: form.max_downloads ?? null,
    };

    try {
      setCreating(true);
      setCreateError(null);
      await adminApiClient.createPermissionLevel(payload);
      setForm({
        name: "",
        description: "",
        can_view: true,
        can_download: false,
        has_expiry: false,
        max_downloads: null,
      });
      await loadLevels();
      setCreateModalOpen(false);
    } catch (err) {
      let message = "Unable to create permission level";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setCreateError(message);
      showToast({
        variant: "error",
        title: "Unable to create level",
        description: message,
      });
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (level: PermissionLevelResponse) => {
    setEditingId(level.id);
    setEdit({
      name: level.name,
      description: level.description,
      can_view: level.can_view,
      can_download: level.can_download,
      has_expiry: level.has_expiry,
      max_downloads: level.max_downloads,
    });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEdit({});
    setEditError(null);
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingId) return;
    if (!edit.name || !edit.description) {
      const message = "Name and description are required";
      setEditError(message);
      return;
    }

    const payload: PermissionLevelUpdate = {
      name: edit.name,
      description: edit.description,
      can_view: edit.can_view,
      can_download: edit.can_download,
      has_expiry: edit.has_expiry,
      max_downloads: edit.max_downloads ?? null,
    };

    try {
      setEditSaving(true);
      setEditError(null);
      await adminApiClient.updatePermissionLevel(editingId, payload);
      await loadLevels();
      cancelEdit();
    } catch (err) {
      let message = "Unable to update permission level";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setEditError(message);
      showToast({
        variant: "error",
        title: "Unable to update level",
        description: message,
      });
    } finally {
      setEditSaving(false);
    }
  };

  const openDeleteConfirm = (level: PermissionLevelResponse) => {
    setConfirmingDeleteLevel(level);
    setActionError(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmingDeleteLevel) return;

    const level = confirmingDeleteLevel;

    try {
      setActionId(level.id);
      setActionError(null);
      await adminApiClient.deletePermissionLevel(level.id);
      await loadLevels();
      showToast({
        variant: "success",
        title: "Permission level deleted",
        description: `\"${level.name}\" has been removed.`,
      });
    } catch (err) {
      let message = "Unable to delete permission level";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setActionError(message);
      showToast({
        variant: "error",
        title: "Unable to delete level",
        description: message,
      });
    } finally {
      setActionId(null);
      setConfirmingDeleteLevel(null);
    }
  };

  const handleCancelDelete = () => {
    if (actionId) return;
    setConfirmingDeleteLevel(null);
  };

  const toggleBooleanField = <K extends keyof PermissionLevelCreate>(
    key: K,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: !prev[key] as PermissionLevelCreate[K],
    }));
  };

  const toggleEditBooleanField = <K extends keyof PermissionLevelUpdate>(
    key: K,
  ) => {
    setEdit((prev) => ({
      ...prev,
      [key]: !prev[key] as PermissionLevelUpdate[K],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
        <p className="text-sm text-slate-600">
          Manage permission levels for investor access to documents.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-800">
              Permission levels
            </h2>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setForm({
                  name: "",
                  description: "",
                  can_view: true,
                  can_download: false,
                  has_expiry: false,
                  max_downloads: null,
                });
                setCreateError(null);
                setCreateModalOpen(true);
              }}
            >
              Add level
            </Button>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {actionError && <Alert variant="error">{actionError}</Alert>}

          {loading ? (
            <DataTable
              columns={[
                "Name",
                "Description",
                "View",
                "Download",
                "Expiry",
                "Max downloads",
                "Actions",
              ]}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-3 py-2">
                    <div className="h-3 w-32 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-40 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : levels.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/5 text-xs font-semibold text-brand-red">
                PR
              </div>
              <p className="text-sm font-medium text-slate-900">
                No permission levels configured
              </p>
              <p className="text-xs text-slate-600">
                Create permission levels to control how investors can view and download
                documents.
              </p>
            </div>
          ) : (
            <DataTable
              columns={[
                "Name",
                "Description",
                "View",
                "Download",
                "Expiry",
                "Max downloads",
                "Actions",
              ]}
            >
              {levels.map((level) => (
                <tr
                  key={level.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                      <td className="px-3 py-2 text-xs font-medium text-slate-800">
                        {level.name}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {level.description}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {level.can_view ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {level.can_download ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {level.has_expiry ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {level.max_downloads ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => startEdit(level)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={actionId === level.id}
                            onClick={() => openDeleteConfirm(level)}
                          >
                            {actionId === level.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </DataTable>
          )}
        </Card>

        <div className="space-y-4">
          <Modal
            open={createModalOpen}
            title="Create level"
            description="Define a new permission level for investors."
            onClose={() => {
              if (!creating) {
                setCreateModalOpen(false);
              }
            }}
            size="sm"
          >
            <form className="space-y-3" onSubmit={handleCreate}>
              <Input
                label="Name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Internal name"
              />
              <Input
                label="Description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="What this level allows"
              />

              <div className="flex flex-col gap-2 text-sm">
                <label className="text-sm font-medium text-slate-800">
                  Capabilities
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.can_view ?? false}
                    onChange={() => toggleBooleanField("can_view")}
                  />
                  Can view documents
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.can_download ?? false}
                    onChange={() => toggleBooleanField("can_download")}
                  />
                  Can download documents
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.has_expiry ?? false}
                    onChange={() => toggleBooleanField("has_expiry")}
                  />
                  Has expiry
                </label>
              </div>

              <Input
                label="Max downloads (optional)"
                type="number"
                value={form.max_downloads === null || form.max_downloads === undefined ? "" : String(form.max_downloads)}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    max_downloads: value === "" ? null : Number(value),
                  }));
                }}
                helperText="Leave blank for unlimited"
              />

              {createError && <Alert variant="error">{createError}</Alert>}

              <Button
                type="submit"
                className="w-full"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create level"}
              </Button>
            </form>
          </Modal>

          <Modal
            open={!!editingId}
            title="Edit permission level"
            description="Adjust the capabilities and limits for this permission level."
            onClose={cancelEdit}
            size="md"
          >
            <form className="space-y-3" onSubmit={handleSaveEdit}>
              <Input
                label="Name"
                value={edit.name ?? ""}
                onChange={(event) =>
                  setEdit((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Internal name"
              />
              <Input
                label="Description"
                value={edit.description ?? ""}
                onChange={(event) =>
                  setEdit((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="What this level allows"
              />

              <div className="flex flex-col gap-2 text-sm">
                <label className="text-sm font-medium text-slate-800">
                  Capabilities
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={edit.can_view ?? false}
                    onChange={() => toggleEditBooleanField("can_view")}
                  />
                  Can view documents
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={edit.can_download ?? false}
                    onChange={() => toggleEditBooleanField("can_download")}
                  />
                  Can download documents
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={edit.has_expiry ?? false}
                    onChange={() => toggleEditBooleanField("has_expiry")}
                  />
                  Has expiry
                </label>
              </div>

              <Input
                label="Max downloads (optional)"
                type="number"
                value={edit.max_downloads === null || edit.max_downloads === undefined ? "" : String(edit.max_downloads)}
                onChange={(event) => {
                  const value = event.target.value;
                  setEdit((prev) => ({
                    ...prev,
                    max_downloads: value === "" ? null : Number(value),
                  }));
                }}
                helperText="Leave blank for unlimited"
              />

              {editError && <Alert variant="error">{editError}</Alert>}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Save changes"}
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
          <ConfirmDialog
            open={!!confirmingDeleteLevel}
            title="Delete permission level?"
            description={
              confirmingDeleteLevel ? (
                <span>
                  This will permanently remove the level
                  {" "}
                  <span className="font-semibold text-slate-900">
                    {confirmingDeleteLevel.name}
                  </span>
                  {" "}
                  from the system.
                </span>
              ) : null
            }
            confirmLabel={
              confirmingDeleteLevel && actionId === confirmingDeleteLevel.id
                ? "Deleting..."
                : "Delete"
            }
            cancelLabel="Cancel"
            loading={
              !!(
                confirmingDeleteLevel && actionId === confirmingDeleteLevel.id
              )
            }
            onConfirm={() => {
              void handleConfirmDelete();
            }}
            onCancel={handleCancelDelete}
          />
        </div>
      </div>
    </div>
  );
}
