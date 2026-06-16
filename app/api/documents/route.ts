import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { extractText } from "@/lib/documents/extract";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Upload a CV: extract its text server-side and store it.
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
    const text = await extractText(file.name, buffer);
    if (!text) {
      return NextResponse.json(
        { error: "Could not extract any text from the document" },
        { status: 422 }
      );
    }

    const [doc] = await db
      .insert(documents)
      .values({
        userId: session.user.id,
        kind: "cv",
        filename: file.name,
        extractedText: text,
      })
      .returning({
        id: documents.id,
        filename: documents.filename,
        createdAt: documents.createdAt,
      });

    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

// Latest uploaded document (metadata only).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [doc] = await db
    .select({
      id: documents.id,
      filename: documents.filename,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, session.user.id))
    .orderBy(desc(documents.createdAt))
    .limit(1);

  return NextResponse.json(doc ?? null);
}
