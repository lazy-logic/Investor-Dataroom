import { NextResponse } from "next/server";
import { isNdaAccepted } from "../../_mock-store";

function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, value] = authHeader.split(" ");
  if (scheme !== "Bearer" || !value) return null;
  return value;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const accepted = isNdaAccepted(token);

  if (!accepted) {
    return NextResponse.json({ accepted: false });
  }

  const now = new Date().toISOString();

  return NextResponse.json({
    accepted: true,
    accepted_at: now,
    version: "1.0",
    nda_id: "mock-nda-1",
  });
}
