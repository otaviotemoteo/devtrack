import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { repositories } from "@/db/schema";

// List the user's cached repos (the pre-scan screen syncs first via POST /sync).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repos = await db
    .select()
    .from(repositories)
    .where(eq(repositories.userId, session.user.id))
    .orderBy(repositories.fullName);

  return NextResponse.json({ repositories: repos });
}
