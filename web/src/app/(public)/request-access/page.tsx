"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { apiClient, APIClientError } from "@/lib/api-client";

export default function RequestAccessPage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const email = String(formData.get("email") ?? "").trim();
    const name = String(formData.get("fullName") ?? "").trim();
    const company = String(formData.get("organization") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!email || !name || !company) {
      setErrorMessage("Email, full name, and organization are required.");
      setStatus("error");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setStatus("idle");

      await apiClient.submitAccessRequest({
        name,
        email,
        company,
        message: message || undefined,
      });

      setStatus("success");
    } catch (err) {
      console.error("Failed to submit access request:", err);
      
      if (err instanceof APIClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unable to submit your request. Please try again.");
      }
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card className="border-slate-200">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Request Received
            </h1>
            <p className="text-sm text-slate-700">
              We&apos;ve recorded your access request. SAYeTECH will review and contact you
              by email with next steps and secure access details.
            </p>
            <p className="text-sm text-slate-600">
              If you don&apos;t receive a response within a few business days, please reach out to the SAYeTECH team.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="text-sm text-brand-red hover:underline"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Request Access to SAYeTECH Data Room
        </h1>
        <p className="text-sm text-slate-700">
          Submit your details to request secure access to SAYeTECH&apos;s investor
          data room. The team will review and confirm access via email.
        </p>
        <p className="text-xs text-slate-500">
          Fields marked as required help the SAYeTECH team understand who you are
          and how best to process your request.
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="text-sm text-brand-red hover:underline"
          >
            Already have access? Login →
          </Link>
        </div>
      </div>
      <Card className="border-slate-200">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input name="email" label="Email" type="email" required />
          <Input name="fullName" label="Full name" required />
          <Input
            name="organization"
            label="Organization / Fund"
            required
          />
          <Input name="roleTitle" label="Role / Title" />
          <div className="flex flex-col gap-1 text-sm">
            <label className="font-medium text-slate-800">Investor type</label>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red"
              name="investorType"
            >
              <option value="">Select type (optional)</option>
              <option value="angel">Angel</option>
              <option value="vc">VC</option>
              <option value="family-office">Family office</option>
              <option value="strategic">Strategic</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Textarea
            name="message"
            label="Short message (optional)"
            rows={3}
            helperText="Optional context or notes for the SAYeTECH team."
          />
          {status === "error" && errorMessage && (
            <Alert variant="error">{errorMessage}</Alert>
          )}
          <Button
            type="submit"
            variant="cta"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Request access"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
