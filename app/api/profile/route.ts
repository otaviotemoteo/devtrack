import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { updateProfile } from "@/lib/profile";
import { experienceSchema } from "@/lib/experiences";

const bodySchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    githubLogin: z.string().max(60).nullable().optional(),
    situation: z.enum(["employed", "searching", "student"]).optional(),
    currentRole: z.string().max(200).nullable().optional(),
    currentCompany: z.string().max(200).nullable().optional(),
    currentSince: z.string().max(100).nullable().optional(),
    projects: z.string().max(2000).nullable().optional(),
    targetRole: z.string().max(200).nullable().optional(),
    industry: z.string().max(200).nullable().optional(),
    extraInstructions: z.string().max(2000).nullable().optional(),
    experiences: z.array(experienceSchema).max(20).optional(),
    contextPromptDismissed: z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "Provide at least one field",
  });

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

  try {
    const updated = await updateProfile(session.user.id, parsed.data);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
