import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { profileSettings } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/profile";

const bodySchema = z.object({
  firstChoice: z.enum(["linkedin", "cv", "github"]).optional(),
});

// Mark the user onboarded (+ optional first-choice). Shown-once picker gate.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine ("explore on my own")
  }

  const parsed = bodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 422 });
  }

  await getOrCreateProfile(session.user.id);

  const set: { onboarded: true; updatedAt: Date; firstChoice?: "linkedin" | "cv" | "github" } = {
    onboarded: true,
    updatedAt: new Date(),
  };
  if (parsed.data.firstChoice) set.firstChoice = parsed.data.firstChoice;

  await db
    .update(profileSettings)
    .set(set)
    .where(eq(profileSettings.userId, session.user.id));

  return NextResponse.json({ ok: true });
}
