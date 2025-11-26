import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  return NextResponse.json({
    version: "1.0",
    content: `<p>This Non-Disclosure Agreement (NDA) governs your access to confidential information provided by SAYeTECH. By continuing, you agree to keep all documents and data strictly confidential and to use them solely for evaluating a potential investment.</p>
<p>You must not copy, distribute, or disclose any information to third parties without prior written consent from SAYeTECH.</p>`,
    effective_date: today,
  });
}
