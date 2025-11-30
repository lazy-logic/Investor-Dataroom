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
  type AdminUserPermissions,
} from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";

interface FormState {
  email: string;
  fullName: string;
  password: string;
  role: AdminRole;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [form, setForm] = useState<FormState>({
    email: "",
    fullName: "",
    password: "",
    role: "user",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("user");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedPermissionsUser, setSelectedPermissionsUser] =
    useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminUserPermissions | null>(
    null,
  );
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [confirmingDeactivateUser, setConfirmingDeactivateUser] =
    useState<AdminUser | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiClient.listUsers();
      setUsers(data);
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
      setLoading(false);
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
      });

      setForm({ email: "", fullName: "", password: "", role: "user" });

      await loadUsers();
      setCreateModalOpen(false);
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
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFullName("");
    setEditRole("user");
    setEditError(null);
  };

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingId) return;

    try {
      setEditSaving(true);
      setEditError(null);

      const updated = await adminApiClient.updateUser(editingId, {
        full_name: editFullName,
        role: editRole,
      });

      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== editingId) return user;
          if (updated && typeof updated === "object" && "id" in updated) {
            return updated as AdminUser;
          }
          return {
            ...user,
            full_name: editFullName,
            role: editRole,
          };
        }),
      );

      cancelEdit();
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
      await loadUsers();
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

  const handleViewPermissions = async (user: AdminUser) => {
    try {
      setPermissionsLoading(true);
      setPermissionsError(null);
      setSelectedPermissionsUser(user);
      const data = await adminApiClient.getUserPermissions(user.id);
      setPermissions(data);
    } catch (err) {
      let message = "Unable to load user permissions";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setPermissionsError(message);
      showToast({
        variant: "error",
        title: "Unable to load permissions",
        description: message,
      });
      setPermissions(null);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const closePermissionsModal = () => {
    if (permissionsLoading) return;
    setSelectedPermissionsUser(null);
    setPermissions(null);
    setPermissionsError(null);
  };

  const handleActivate = async (user: AdminUser) => {
    try {
      setActionId(user.id);
      setActionError(null);
      await adminApiClient.activateUser(user.id);
      await loadUsers();
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
                    <div className="h-3 w-20 rounded bg-slate-200" />
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
                "Status",
                ...(isSuperAdmin ? ["Actions"] : []),
              ]}
            >
              {users.map((user) => (
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
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={
                                permissionsLoading &&
                                selectedPermissionsUser?.id === user.id
                              }
                              onClick={() => void handleViewPermissions(user)}
                            >
                              {permissionsLoading &&
                              selectedPermissionsUser?.id === user.id
                                ? "Loading..."
                                : "Permissions"}
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
                  ))}
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
            open={!!selectedPermissionsUser}
            title="User permissions"
            description={
              selectedPermissionsUser
                ? `Effective permissions for ${selectedPermissionsUser.email}.`
                : undefined
            }
            onClose={closePermissionsModal}
            size="md"
          >
            {permissionsError && (
              <Alert variant="error">{permissionsError}</Alert>
            )}

            {permissionsLoading ? (
              <p className="text-xs text-slate-600">Loading permissions...</p>
            ) : permissions ? (
              <pre className="max-h-64 overflow-auto rounded-md bg-slate-950 px-3 py-2 text-[11px] text-slate-50">
                {JSON.stringify(permissions, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-slate-600">
                No permission details available.
              </p>
            )}
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
