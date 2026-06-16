import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { repositories } from "@/db/schema";

const patchSchema = z
  .object({
    selected: z.boolean().optional(),
    userContext: z.string().max(2000).nullable().optional(),
  })
  .refine((d) => d.selected !== undefined || d.userContext !== undefined, {
    message: "Provide selected and/or userContext",
  });

// Update the user-owned selection / context for one repo.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const [updated] = await db
    .update(repositories)
    .set(parsed.data)
    .where(
      and(eq(repositories.id, id), eq(repositories.userId, session.user.id))
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
