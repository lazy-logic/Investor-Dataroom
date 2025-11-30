"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitAccessRequest, type AccessRequestInput } from "@/lib/api";
import type { InvestorType } from "@/lib/types";

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
    const roleTitle = String(formData.get("roleTitle") ?? "").trim();
    const investorTypeRaw = String(formData.get("investorType") ?? "").trim();
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

      const allowedTypes: InvestorType[] = [
        "angel",
        "vc",
        "family-office",
        "strategic",
        "other",
      ];
      const typeValue = (investorTypeRaw || "other") as InvestorType;
      const investorType: InvestorType = allowedTypes.includes(typeValue)
        ? typeValue
        : "other";

      const payload: AccessRequestInput = {
        email,
        fullName: name,
        organization: company,
        roleTitle,
        investorType,
        message: message || undefined,
      };

      const result = await submitAccessRequest(payload);

      if (!result.ok) {
        setErrorMessage(
          result.error ||
            "Unable to submit your request. Please try again or contact SAYeTECH.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch (err) {
      console.error("Failed to submit access request:", err);
      setErrorMessage("Unable to submit your request. Please try again.");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card className="border-slate-200 bg-white/90 shadow-sm">
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
              If your request is approved, you&apos;ll receive an email with a secure login
              link. You&apos;ll sign our NDA digitally and then be taken straight to the
              investor dashboard.
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
      <div className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-red">
          Investor Access Request
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Request access to SAYeTECH&apos;s investor data room
        </h1>
        <p className="text-sm text-slate-700">
          Share a few details about yourself and your organization. We&apos;ll review
          your request, confirm fit, and send you a secure login link.
        </p>
        <ul className="space-y-2 text-xs text-slate-600">
          <li>
            <span className="font-medium text-slate-800">1.</span> Submit your
            access request with your fund details.
          </li>
          <li>
            <span className="font-medium text-slate-800">2.</span> SAYeTECH
            reviews and approves.
          </li>
          <li>
            <span className="font-medium text-slate-800">3.</span> You receive
            an OTP login &amp; NDA link to enter the data room.
          </li>
        </ul>
        <div className="pt-4">
          <Link
            href="/login"
            className="text-sm text-brand-red hover:underline"
          >
            Already have access? Login →
          </Link>
        </div>
      </div>
      <Card className="border-slate-200 bg-white/95 shadow-sm">
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
