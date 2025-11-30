import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const rawName =
      typeof body.name === "string" ? body.name : (body as any).full_name;
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const email =
      typeof body.email === "string" ? (body.email as string).trim() : "";

    if (!name || !email) {
      return NextResponse.json(
        { detail: "Full name and email are required" },
        { status: 400 },
      );
    }

    const requestId = `mock_${Date.now()}`;

    return NextResponse.json({
      message: "Access request submitted successfully",
      request_id: requestId,
      id: requestId,
      email,
      full_name: name,
      company: (body as any).company ?? null,
      request_message: (body as any).message ?? null,
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to submit access request" },
      { status: 500 },
    );
  }
}
