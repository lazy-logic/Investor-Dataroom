import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";

    // In this mock implementation, any email address is treated as approved.
    if (!email) {
      return NextResponse.json(
        { detail: "Email is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Login code sent to your email.",
      expires_in_minutes: 10,
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to process request" },
      { status: 500 }
    );
  }
}
