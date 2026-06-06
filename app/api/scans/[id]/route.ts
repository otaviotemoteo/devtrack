import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { scans } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [scan] = await db
    .select({
      id: scans.id,
      status: scans.status,
      progress: scans.progress,
      errorMessage: scans.errorMessage,
      createdAt: scans.createdAt,
    })
    .from(scans)
    .where(and(eq(scans.id, id), eq(scans.userId, session.user.id)))
    .limit(1);

  if (!scan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(scan);
}
