import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { profileSettings } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/profile";

const bodySchema = z
  .object({
    targetRole: z.string().max(200).nullable().optional(),
    industry: z.string().max(200).nullable().optional(),
    extraInstructions: z.string().max(2000).nullable().optional(),
    contextPromptDismissed: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.targetRole !== undefined ||
      d.industry !== undefined ||
      d.extraInstructions !== undefined ||
      d.contextPromptDismissed !== undefined,
    { message: "Provide at least one field" }
  );

// Save standing profile context (the default context for every generator).
export async function PATCH(request: Request) {
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

  await getOrCreateProfile(session.user.id);

  const [updated] = await db
    .update(profileSettings)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profileSettings.userId, session.user.id))
    .returning();

  return NextResponse.json(updated);
}
