/**
 * API layer for SAYeTECH Investor Dataroom
 * Direct calls to backend API
 */

import type {
  AccessRequestRecord,
  InvestorProfile,
  InvestorType,
  NdaTemplate,
} from "./types";
import type {
  NDAAcceptance,
  NDAContent,
  OTPResponse,
  TokenResponse,
  UserResponse,
} from "./api-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://dataroom-backend-api.onrender.com";

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  }) as Promise<T>;
}

// ---- Auth / OTP -----------------------------------------------------------

async function extractError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string };
    if (body.detail) return body.detail;
  } catch {}

  const text = await response.text().catch(() => "");
  if (text) return text;
  return `Request failed with status ${response.status}`;
}

const jsonHeaders = (token?: string): HeadersInit => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const authHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
});

export async function requestLoginCode(
  email: string,
  purpose?: "investor_login" | "access_request",
): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    // Build request body - always include purpose with default "access_request"
    const body = {
      email,
      purpose: purpose || "access_request",
    };

    const response = await withTimeout(
      fetch(`${API_BASE_URL}/api/otp/request`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      }),
      15000,
      "The login service is taking longer than expected. Please check your connection and try again.",
    );

    if (!response.ok) {
      return { ok: false, error: await extractError(response) };
    }

    // Response body contains metadata but callers only care about success.
    await response.json().catch(() => ({} as OTPResponse));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to contact authentication service.",
    };
  }
}

export async function verifyLoginCode(
  email: string,
  code: string,
  purpose?: "investor_login" | "access_request",
): Promise<{
  ok: boolean;
  token?: string;
  tokenType?: string;
  user?: Record<string, unknown>;
  error?: string;
}> {
  if (!email.trim() || !code.trim()) {
    return { ok: false, error: "Email and verification code are required." };
  }

  try {
    // Build request body - always include purpose with default "access_request"
    const body = {
      email,
      otp_code: code,
      purpose: purpose || "access_request",
    };

    const response = await withTimeout(
      fetch(`${API_BASE_URL}/api/otp/verify`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      }),
      15000,
      "Verification is taking longer than expected. Please check your connection and try again.",
    );

    if (!response.ok) {
      return { ok: false, error: await extractError(response) };
    }

    const data = (await response.json()) as TokenResponse;
    return {
      ok: true,
      token: data.access_token,
      tokenType: data.token_type,
      user: data.user,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to verify the provided code.",
    };
  }
}

// ---- Investor profiles ----------------------------------------------------

export async function getCurrentInvestorProfile(
  token: string,
): Promise<InvestorProfile | null> {
  if (!token) return null;

  try {
    // Use the correct backend endpoint /api/admin-auth/me
    const response = await fetch(`${API_BASE_URL}/api/admin-auth/me`, {
      headers: authHeaders(token),
    });

    if (!response.ok) {
      if (response.status === 401) return null;
      throw new Error(await extractError(response));
    }

    const data = (await response.json()) as {
      id: string;
      email: string;
      full_name: string;
      role: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };

    return {
      id: data.id,
      fullName: data.full_name || data.email,
      organization: "",
      roleTitle: data.role || "",
      investorType: "other",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("getCurrentInvestorProfile error", error);
    return null;
  }
}

// ---- NDA ------------------------------------------------------------------

export async function getActiveNdaTemplate(
  token?: string,
): Promise<NdaTemplate | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nda/content`, {
      headers: token ? authHeaders(token) : undefined,
    });

    if (!response.ok) {
      throw new Error(await extractError(response));
    }

    const content = (await response.json()) as NDAContent;
    return {
      id: content.version,
      version: content.version,
      title: `SAYeTECH NDA (v${content.version})`,
      body: content.content,
      isActive: true,
      createdAt: content.effective_date,
    };
  } catch (error) {
    console.error("getActiveNdaTemplate error", error);
    return null;
  }
}

export async function acceptNda(
  token: string,
  payload: NDAAcceptance,
): Promise<{ ok: boolean; error?: string }> {
  if (!token) {
    return { ok: false, error: "Authentication token is required" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/nda/accept`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, error: await extractError(response) };
    }

    await response.json().catch(() => ({}));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to record NDA acceptance.",
    };
  }
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
  // Build payload matching the backend AccessRequestCreate schema
  const payload: {
    email: string;
    full_name: string;
    company: string;
    phone?: string | null;
    message?: string | null;
  } = {
    email: input.email,
    full_name: input.fullName,
    company: input.organization,
    // Include role title and investor type in the message if provided
    message: [
      input.message,
      input.roleTitle ? `Role: ${input.roleTitle}` : null,
      input.investorType && input.investorType !== "other" ? `Investor Type: ${input.investorType}` : null,
    ].filter(Boolean).join("\n") || null,
  };

  try {
    const response = await withTimeout(
      fetch(`${API_BASE_URL}/api/access-requests/`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
      }),
      15000,
      "The request is taking longer than expected. Please check your connection and try again.",
    );

    if (!response.ok) {
      return { ok: false, error: await extractError(response) };
    }

    const data = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const record: AccessRequestRecord = {
      id: String(data.id ?? data.request_id ?? Date.now()),
      email: input.email,
      fullName: input.fullName,
      organization: input.organization,
      roleTitle: input.roleTitle,
      investorType: input.investorType,
      message: input.message,
      status: "PENDING",
      createdAt:
        typeof data.created_at === "string"
          ? data.created_at
          : new Date().toISOString(),
    };

    return { ok: true, record };
  } catch (error) {
    console.error("submitAccessRequest error", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit request at this time.",
    };
  }
}
