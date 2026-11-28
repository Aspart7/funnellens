import { NextResponse } from "next/server";
import { getSampleAuditById } from "@/lib/auditor/sample-audits";
import { getStoredAuditById } from "@/lib/auditor/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const audit = getSampleAuditById(id) ?? getStoredAuditById(id);

  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  return NextResponse.json({ audit });
}
