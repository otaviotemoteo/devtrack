import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { linkedinImports } from "@/db/schema";
import { parseLinkedInExport } from "@/lib/linkedin/import-export";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

// Import the official LinkedIn data export (ZIP of CSVs) and normalize it.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  try {
    const data = parseLinkedInExport(buffer);

    const [imp] = await db
      .insert(linkedinImports)
      .values({ userId: session.user.id, source: "export", data })
      .returning({
        id: linkedinImports.id,
        createdAt: linkedinImports.createdAt,
      });

    return NextResponse.json({ ...imp, data }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not parse the LinkedIn export";
    return NextResponse.json(
      { error: `Invalid LinkedIn export: ${message}` },
      { status: 422 }
    );
  }
}
