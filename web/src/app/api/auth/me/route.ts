import { NextResponse } from "next/server";
import { getUserForToken } from "../../_mock-store";

function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, value] = authHeader.split(" ");
  if (scheme !== "Bearer" || !value) return null;
  return value;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = getTokenFromHeader(authHeader);
  const user = getUserForToken(token);

  if (!user) {
    return NextResponse.json(
      { detail: "Unauthorized" },
      { status: 401 }
    );
  }

  const now = new Date().toISOString();

  return NextResponse.json({
    id: `mock-${token}`,
    name: user.name,
    email: user.email,
    role_id: "investor",
    permission_level_id: 1,
    created_at: now,
    updated_at: now,
  });
}
