import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { extractText } from "@/lib/documents/extract";
import { runStandaloneGeneration } from "@/lib/run-generation";
import { scanConfigSchema } from "@/lib/scan/config";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Upload a CV → extract text → analyze it. GitHub evidence is optional
// enrichment — used when a scan exists, gracefully skipped when it doesn't.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' upload" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const text = await extractText(file.name, buffer);
    if (!text) {
      return NextResponse.json(
        { error: "Could not extract any text from the document" },
        { status: 422 }
      );
    }

    await db.insert(documents).values({
      userId: session.user.id,
      kind: "cv",
      filename: file.name,
      extractedText: text,
    });

    const result = await runStandaloneGeneration(
      session.user.id,
      "cv",
      scanConfigSchema.parse({ target: { kind: "global" } })
    );
    return NextResponse.json({ generationId: result.generationId }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "CV analysis failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
