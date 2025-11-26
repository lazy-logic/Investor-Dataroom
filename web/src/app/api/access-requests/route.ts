import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!name || !email) {
      return NextResponse.json(
        { detail: "Name and email are required" },
        { status: 400 }
      );
    }

    const requestId = `mock_${Date.now()}`;

    return NextResponse.json({
      message: "Access request submitted successfully",
      request_id: requestId,
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to submit access request" },
      { status: 500 }
    );
  }
}
