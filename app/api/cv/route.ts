import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { extractText } from "@/lib/documents/extract";
import { getLatestEvidenceScan, runGeneration } from "@/lib/run-generation";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Upload a CV → extract text → analyze it against the latest GitHub evidence.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gate: CV analysis cross-references GitHub evidence from a completed scan.
  const scan = await getLatestEvidenceScan(session.user.id);
  if (!scan) {
    return NextResponse.json(
      { error: "Run a GitHub scan first" },
      { status: 409 }
    );
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

    const result = await runGeneration(scan.id, "cv");
    return NextResponse.json({ generationId: result.generationId }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "CV analysis failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
