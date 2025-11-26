import { NextResponse } from "next/server";
import { upsertUserForEmail } from "../../_mock-store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { detail: "Email is required" },
        { status: 400 }
      );
    }

    const { token } = upsertUserForEmail(email);

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to complete auto-login" },
      { status: 500 }
    );
  }
}
