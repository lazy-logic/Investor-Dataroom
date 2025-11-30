"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { adminApiClient, type AdminUser } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const current = await adminApiClient.getCurrentAdmin();
        setAdmin(current);
        setFullName(current.full_name);
      } catch (err) {
        let message = "Unable to load profile";
        if (err instanceof APIClientError) {
          message = err.message || message;
        }
        setError(message);
        showToast({
          variant: "error",
          title: "Unable to load profile",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!admin) return;

    if (!fullName.trim()) {
      const message = "Full name is required";
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
      setSaving(true);
      setError(null);
      setSuccess(null);

      await adminApiClient.updateCurrentAdmin({ full_name: fullName.trim() });

      setAdmin({ ...admin, full_name: fullName.trim() });
      const message = "Profile updated successfully";
      setSuccess(message);
      showToast({
        variant: "success",
        title: "Profile updated",
        description: message,
      });
    } catch (err) {
      let message = "Unable to update profile";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      setSuccess(null);
      showToast({
        variant: "error",
        title: "Unable to update profile",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-slate-600">
          View and update your admin profile details.
        </p>
      </div>

      <Card className="max-w-lg space-y-4">
        {loading && !admin ? (
          <p className="text-sm text-slate-600">Loading profile...</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
            />

            {admin && (
              <div className="grid gap-2 text-xs text-slate-600">
                <div>
                  <span className="font-medium text-slate-700">Email:</span>{" "}
                  <span className="font-mono text-slate-800">{admin.email}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Role:</span>{" "}
                  <span className="capitalize">{admin.role.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Member since:</span>{" "}
                  <span>
                    {new Date(admin.created_at).toLocaleDateString()} at {" "}
                    {new Date(admin.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            {success && (
              <p className="text-xs text-brand-green">{success}</p>
            )}

            <Button type="submit" disabled={saving || !admin}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
