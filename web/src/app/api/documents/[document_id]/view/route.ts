import { NextResponse } from "next/server";
import { getDocumentById } from "../../../_mock-docs";
import { getDemoPdfBytes } from "../../../_demo-pdf";

interface Params {
  params: { document_id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const doc = getDocumentById(params.document_id);

  if (!doc) {
    return NextResponse.json({ detail: "Document not found" }, { status: 404 });
  }

  const pdfBytes = getDemoPdfBytes();
  const buffer = pdfBytes.buffer as ArrayBuffer;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  });
}
