"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  adminApiClient,
  type AdminUser,
  type AdminRole,
} from "@/lib/admin-api-client";
import type { PermissionLevelResponse } from "@/lib/api-types";
import { APIClientError } from "@/lib/api-client";

interface FormState {
  email: string;
  fullName: string;
  password: string;
  role: AdminRole;
  permissionLevelId: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissionLevels, setPermissionLevels] = useState<PermissionLevelResponse[]>([]);

  const [form, setForm] = useState<FormState>({
    email: "",
    fullName: "",
    password: "",
    role: "user",
    permissionLevelId: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("user");
  const [editPermissionLevelId, setEditPermissionLevelId] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { showToast } = useToast();
  const [confirmingDeactivateUser, setConfirmingDeactivateUser] =
    useState<AdminUser | null>(null);

  const loadUsers = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const data = await adminApiClient.listUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      let message = "Unable to load users";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      showToast({
        variant: "error",
        title: "Unable to load users",
        description: message,
      });
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadPermissionLevels = async () => {
    try {
      const levels = await adminApiClient.listPermissionLevels();
      setPermissionLevels(levels);
    } catch (err) {
      let message = "Unable to load permission levels";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      showToast({
        variant: "error",
        title: "Permissions unavailable",
        description: message,
      });
    }
  };

  const loadCurrentAdminRole = async () => {
    try {
      const admin = await adminApiClient.getCurrentAdmin();
      setIsSuperAdmin(admin.role === "super_admin");
    } catch {
    }
  };

  useEffect(() => {
    void loadCurrentAdminRole();
    void loadUsers();
    void loadPermissionLevels();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.email || !form.fullName || !form.password) {
      const message = "Email, full name, and password are required";
      setCreateError(message);
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);

      await adminApiClient.createUser({
        email: form.email,
        full_name: form.fullName,
        password: form.password,
        role: form.role,
        permission_level_id: form.permissionLevelId || null,
      });

      setForm({
        email: "",
        fullName: "",
        password: "",
        role: "user",
        permissionLevelId: "",
      });

      setCreateModalOpen(false);
      void loadUsers({ silent: true });
    } catch (err) {
      let message = "Unable to create user";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setCreateError(message);
      showToast({
        variant: "error",
        title: "Unable to create user",
        description: message,
      });
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setEditFullName(user.full_name);
    setEditRole(user.role);
    setEditPermissionLevelId(user.permission_level_id ?? "");
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFullName("");
    setEditRole("user");
    setEditPermissionLevelId("");
    setEditError(null);
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingId) return;

    try {
      setEditSaving(true);
      setEditError(null);

      await adminApiClient.updateUser(editingId, {
        full_name: editFullName,
        role: editRole,
        permission_level_id: editPermissionLevelId || null,
      });
      cancelEdit();
      void loadUsers({ silent: true });
    } catch (err) {
      let message = "Unable to update user";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setEditError(message);
      showToast({
        variant: "error",
        title: "Unable to update user",
        description: message,
      });
    } finally {
      setEditSaving(false);
    }
  };

  const openDeactivateConfirm = (user: AdminUser) => {
    setConfirmingDeactivateUser(user);
    setActionError(null);
  };

  const handleConfirmDeactivate = async () => {
    if (!confirmingDeactivateUser) return;

    const user = confirmingDeactivateUser;

    try {
      setActionId(user.id);
      setActionError(null);
      await adminApiClient.deactivateUser(user.id);
      void loadUsers({ silent: true });
      showToast({
        variant: "success",
        title: "User deactivated",
        description: `${user.email} has been deactivated.`,
      });
    } catch (err) {
      let message = "Unable to deactivate user";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setActionError(message);
      showToast({
        variant: "error",
        title: "Unable to deactivate user",
        description: message,
      });
    } finally {
      setActionId(null);
      setConfirmingDeactivateUser(null);
    }
  };

  const handleCancelDeactivate = () => {
    if (actionId) return;
    setConfirmingDeactivateUser(null);
  };

  const handleActivate = async (user: AdminUser) => {
    try {
      setActionId(user.id);
      setActionError(null);
      await adminApiClient.activateUser(user.id);
      void loadUsers({ silent: true });
      showToast({
        variant: "success",
        title: "User activated",
        description: `${user.email} has been re-activated.`,
      });
    } catch (err) {
      let message = "Unable to activate user";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setActionError(message);
      showToast({
        variant: "error",
        title: "Unable to activate user",
        description: message,
      });
    } finally {
      setActionId(null);
    }
  };

  const totalUsers = users.length;
  const inactiveUsers = users.filter((user) => !user.is_active).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-slate-600">
          Manage admin and user accounts, roles, and account status.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-800">All users</h2>
            {isSuperAdmin && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setForm({
                    email: "",
                    fullName: "",
                    password: "",
                    role: "user",
                    permissionLevelId: "",
                  });
                  setCreateError(null);
                  setCreateModalOpen(true);
                }}
              >
                Add user
              </Button>
            )}
          </div>

          {!loading && totalUsers > 0 && (
            <div className="inline-flex items-center gap-3 rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
              <span className="font-medium text-slate-800">{totalUsers} users</span>
              <span className="h-3 w-px bg-slate-200" />
              <span>
                {inactiveUsers} inactive
              </span>
            </div>
          )}

          {error && (
            <Alert variant="error">{error}</Alert>
          )}

          {actionError && (
            <Alert variant="error">{actionError}</Alert>
          )}

          {loading ? (
            <DataTable
              columns={[
                "Email",
                "Name",
                "Role",
                "Permission level",
                "Status",
                ...(isSuperAdmin ? ["Actions"] : []),
              ]}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-3 py-2">
                    <div className="h-3 w-40 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-32 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </td>
                  {isSuperAdmin && (
                    <td className="px-3 py-2">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                    </td>
                  )}
                </tr>
              ))}
            </DataTable>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/5 text-xs font-semibold text-brand-red">
                US
              </div>
              <p className="text-sm font-medium text-slate-900">No users found</p>
              <p className="text-xs text-slate-600">
                Users will appear here once they have been created.
              </p>
            </div>
          ) : (
            <DataTable
              columns={[
                "Email",
                "Name",
                "Role",
                "Permission level",
                "Status",
                ...(isSuperAdmin ? ["Actions"] : []),
              ]}
            >
              {users.map((user) => {
                const fallbackPermissionLevel = permissionLevels.find(
                  (level) => level.id === user.permission_level_id
                );
                const permissionLevelName =
                  user.permission_level?.name ?? fallbackPermissionLevel?.name ?? "—";

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                      <td className="px-3 py-2 text-xs font-mono text-slate-800">
                        {user.email}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-800">
                        {user.full_name}
                      </td>
                      <td className="px-3 py-2 text-xs capitalize text-slate-800">
                        {user.role.replace("_", " ")}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {permissionLevelName}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {user.is_active ? (
                          <StatusBadge variant="success">Active</StatusBadge>
                        ) : (
                          <StatusBadge variant="muted">Inactive</StatusBadge>
                        )}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-3 py-2 text-xs">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => startEdit(user)}
                            >
                              Edit
                            </Button>
                            {user.is_active ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={actionId === user.id}
                                onClick={() => openDeactivateConfirm(user)}
                              >
                                {actionId === user.id ? "Deactivating..." : "Deactivate"}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={actionId === user.id}
                                onClick={() => void handleActivate(user)}
                              >
                                {actionId === user.id ? "Activating..." : "Activate"}
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                  </tr>
                );
              })}
            </DataTable>
          )}
        </Card>

        <div className="space-y-4">
          <Modal
            open={createModalOpen && isSuperAdmin}
            title="Add user"
            description="Create a new admin or standard user account."
            onClose={() => {
              if (!creating) {
                setCreateModalOpen(false);
              }
            }}
            size="sm"
          >
            <form className="space-y-3" onSubmit={handleCreate}>
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="user@example.com"
              />
              <Input
                label="Full name"
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                placeholder="Full name"
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Minimum 8 characters"
              />
              <div className="flex flex-col gap-1 text-sm">
                <label className="text-sm font-medium text-slate-800">Role</label>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
                  value={form.role}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      role: event.target.value as AdminRole,
                    }))
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <label className="text-sm font-medium text-slate-800">
                  Permission level
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
                  value={form.permissionLevelId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      permissionLevelId: event.target.value,
                    }))
                  }
                >
                  <option value="">No level assigned</option>
                  {permissionLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {createError && <Alert variant="error">{createError}</Alert>}

              <Button
                type="submit"
                className="w-full"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create user"}
              </Button>
            </form>
          </Modal>
          <Modal
            open={!!editingId && isSuperAdmin}
            title="Edit user"
            description="Update the user's name and role."
            onClose={cancelEdit}
            size="sm"
          >
            <form className="space-y-3" onSubmit={handleSaveEdit}>
              <Input
                label="Full name"
                value={editFullName}
                onChange={(event) => setEditFullName(event.target.value)}
                placeholder="Full name"
              />
              <div className="flex flex-col gap-1 text-sm">
                <label className="text-sm font-medium text-slate-800">Role</label>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
                  value={editRole}
                  onChange={(event) =>
                    setEditRole(event.target.value as AdminRole)
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <label className="text-sm font-medium text-slate-800">
                  Permission level
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
                  value={editPermissionLevelId}
                  onChange={(event) => setEditPermissionLevelId(event.target.value)}
                >
                  <option value="">No level assigned</option>
                  {permissionLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

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
            open={!!confirmingDeactivateUser}
            title="Deactivate user?"
            description={
              confirmingDeactivateUser ? (
                <span>
                  This will deactivate
                  {" "}
                  <span className="font-mono text-slate-900">
                    {confirmingDeactivateUser.email}
                  </span>
                  {" "}
                  and prevent them from signing in until re-activated.
                </span>
              ) : null
            }
            confirmLabel={
              confirmingDeactivateUser && actionId === confirmingDeactivateUser.id
                ? "Deactivating..."
                : "Deactivate"
            }
            cancelLabel="Cancel"
            loading={
              !!(
                confirmingDeactivateUser && actionId === confirmingDeactivateUser.id
              )
            }
            onConfirm={() => {
              void handleConfirmDeactivate();
            }}
            onCancel={handleCancelDeactivate}
          />
        </div>
      </div>
    </div>
  );
}
