import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { linkedinImports } from "@/db/schema";
import { parseLinkedInExport } from "@/lib/linkedin/import-export";
import { fetchLinkedInProfileViaApify } from "@/lib/linkedin/apify";
import { getLatestEvidenceScan, runGeneration } from "@/lib/run-generation";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

// Import a LinkedIn profile (official export .zip, or Apify URL behind a flag)
// → normalize → audit it against the latest GitHub evidence.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scan = await getLatestEvidenceScan(session.user.id);
  if (!scan) {
    return NextResponse.json(
      { error: "Run a GitHub scan first" },
      { status: 409 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    let source: "export" | "apify";
    let data: unknown;

    if (contentType.includes("application/json")) {
      // Optional, opt-in Apify path.
      const body = await request.json();
      const url = z.string().url().parse((body as { url?: string }).url);
      data = await fetchLinkedInProfileViaApify(url);
      source = "apify";
    } else {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Missing 'file' upload" },
          { status: 400 }
        );
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      data = parseLinkedInExport(buffer);
      source = "export";
    }

    await db
      .insert(linkedinImports)
      .values({ userId: session.user.id, source, data });

    const result = await runGeneration(scan.id, "linkedin_audit");
    return NextResponse.json({ generationId: result.generationId }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LinkedIn import failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
