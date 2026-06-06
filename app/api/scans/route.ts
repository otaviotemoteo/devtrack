import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { scans } from "@/db/schema";
import { scanConfigSchema } from "@/lib/scan/config";
import { runScan } from "@/lib/run-scan";

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

  const parsed = scanConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid config", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const [scan] = await db
    .insert(scans)
    .values({ userId: session.user.id, config: parsed.data })
    .returning({ id: scans.id });

  // Fire-and-forget — do NOT await
  runScan(scan.id);

  return NextResponse.json({ scanId: scan.id }, { status: 201 });
}
