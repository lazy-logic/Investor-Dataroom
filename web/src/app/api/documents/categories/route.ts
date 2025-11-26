import { NextResponse } from "next/server";
import { getCategories } from "../../_mock-docs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parentId = url.searchParams.get("parent_id");
  const categories = getCategories(parentId);
  return NextResponse.json(categories);
}
