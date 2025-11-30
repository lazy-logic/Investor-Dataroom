"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { adminApiClient } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";

export default function AdminChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      const message = "All fields are required";
      setError(message);
      setSuccess(null);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      const message = "New password and confirmation do not match";
      setError(message);
      setSuccess(null);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      return;
    }

    if (newPassword.length < 8) {
      const message = "New password must be at least 8 characters long";
      setError(message);
      setSuccess(null);
      showToast({
        variant: "error",
        title: "Validation error",
        description: message,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await adminApiClient.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      const message = "Password updated successfully";
      setSuccess(message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast({
        variant: "success",
        title: "Password updated",
        description: message,
      });
    } catch (err) {
      let message = "Unable to change password";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      setSuccess(null);
      showToast({
        variant: "error",
        title: "Unable to change password",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Change password</h1>
        <p className="text-sm text-slate-600">
          Update your admin password for the investor data room backend.
        </p>
      </div>

      <Card className="max-w-lg space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            helperText="Minimum 8 characters"
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          {success && (
            <p className="text-xs text-brand-green">{success}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
