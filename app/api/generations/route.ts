import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { scans } from "@/db/schema";
import { runGeneration } from "@/lib/run-generation";

const bodySchema = z.object({
  scanId: z.string().min(1),
  type: z.enum(["linkedin", "cv", "linkedin_audit"]),
  regenerateField: z.string().optional(),
});

// Regenerate a block reusing the scan's stored evidence (no re-scan).
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Ownership check.
  const [scan] = await db
    .select({ id: scans.id })
    .from(scans)
    .where(
      and(eq(scans.id, parsed.data.scanId), eq(scans.userId, session.user.id))
    )
    .limit(1);
  if (!scan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await runGeneration(parsed.data.scanId, parsed.data.type, {
      regenerateField: parsed.data.regenerateField,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
