import { NextResponse } from "next/server";
import { markNdaAccepted } from "../../_mock-store";

function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, value] = authHeader.split(" ");
  if (scheme !== "Bearer" || !value) return null;
  return value;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // We trust the payload for this mock; parse to keep shape compatible
  await request.json().catch(() => ({}));

  markNdaAccepted(token);

  return NextResponse.json({ message: "NDA accepted" });
}
