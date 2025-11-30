// Backend-agnostic API layer.
// These functions define the contract between the Next.js app and the backend
// (e.g. FastAPI). For now, most functions are mocked except where wired to
// the provided OpenAPI backend.

import type {
  AccessRequestRecord,
  InvestorProfile,
  InvestorType,
  NdaTemplate,
} from "./types";

const MOCK_LATENCY_MS = 400;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://dataroom-backend-api.onrender.com";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Auth / OTP -----------------------------------------------------------

export async function requestLoginCode(email: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  await delay(MOCK_LATENCY_MS);
  console.log("[mock] requestLoginCode", { email });
  // TODO: replace with real POST /auth/request-otp
  return { ok: true };
}

export async function verifyLoginCode(code: string): Promise<{
  ok: boolean;
  userId?: string;
  error?: string;
}> {
  await delay(MOCK_LATENCY_MS);
  console.log("[mock] verifyLoginCode", { code });
  // TODO: replace with real POST /auth/verify-otp
  if (!code || code.length < 6) {
    return { ok: false, error: "Invalid code" };
  }
  return { ok: true, userId: "mock-user-id" };
}

// ---- Investor profiles ----------------------------------------------------

export async function getCurrentInvestorProfile(): Promise<InvestorProfile | null> {
  await delay(MOCK_LATENCY_MS);
  // TODO: replace with real GET /me/profile
  return null;
}

// ---- NDA ------------------------------------------------------------------

export async function getActiveNdaTemplate(): Promise<NdaTemplate | null> {
  await delay(MOCK_LATENCY_MS);
  // TODO: replace with real GET /nda/active
  return {
    id: "mock-nda",
    version: "v1",
    title: "SAYeTECH Non-Disclosure Agreement",
    body:
      "NDA text placeholder. The full legal text for SAYeTECH's non-disclosure agreement will appear here.",
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

export async function acceptNda(payload: {
  fullName: string;
}): Promise<{ ok: boolean; error?: string }> {
  await delay(MOCK_LATENCY_MS);
  console.log("[mock] acceptNda", payload);
  // TODO: replace with real POST /nda/accept
  if (!payload.fullName.trim()) {
    return { ok: false, error: "Full name is required" };
  }
  return { ok: true };
}

// ---- Access requests ------------------------------------------------------

export interface AccessRequestInput {
  email: string;
  fullName: string;
  organization: string;
  roleTitle: string;
  investorType: InvestorType;
  message?: string;
}

export async function submitAccessRequest(
  input: AccessRequestInput,
): Promise<{ ok: boolean; error?: string; record?: AccessRequestRecord }> {
  // Map frontend shape to backend AccessRequestCreate schema
  const payload = {
    email: input.email,
    full_name: input.fullName,
    company: input.organization,
    phone: (input as any).phone ?? null,
    message: input.message ?? null,
  };

  try {
    const res = await fetch(`/api/access-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let message = "Unable to submit request.";
      try {
        const errorBody = (await res.json()) as { detail?: string };
        if (typeof errorBody.detail === "string") {
          message = errorBody.detail;
        }
      } catch {
        const text = await res.text().catch(() => "");
        if (text) {
          message = text;
        } else {
          message = `Request failed with status ${res.status}`;
        }
      }
      return {
        ok: false,
        error: message,
      };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const record: AccessRequestRecord = {
      id: String((data as any).id ?? (data as any).request_id ?? ""),
      email: input.email,
      fullName: input.fullName,
      organization: input.organization,
      roleTitle: input.roleTitle,
      investorType: input.investorType,
      message: input.message,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    return { ok: true, record };
  } catch (error) {
    console.error("submitAccessRequest error", error);
    return { ok: false, error: "Unable to submit request at this time." };
  }
}
