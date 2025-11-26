import { NextResponse } from "next/server";
import { getDocumentsByCategoryId } from "../../../../_mock-docs";

interface Params {
  params: { category_id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const documents = getDocumentsByCategoryId(params.category_id);
  return NextResponse.json(documents);
}
