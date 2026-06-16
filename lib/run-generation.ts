import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { scans, generations, documents, linkedinImports } from "@/db/schema";
import { evidenceSchema, type Evidence } from "@/lib/ai/evidence";
import { generateLinkedIn } from "@/lib/ai/generators/linkedin";
import { analyzeCv } from "@/lib/ai/generators/cv";
import { auditLinkedIn } from "@/lib/ai/generators/linkedin-audit";
import { scanConfigSchema } from "@/lib/scan/config";

export type GenerationType = "linkedin" | "cv" | "linkedin_audit";

export interface RunGenerationResult {
  generationId: string;
  type: GenerationType;
  output: Record<string, unknown>;
}

/**
 * STAGE 2 (shared) — produce one generation from a scan's stored Evidence.
 * Reused by `runScan` and the regenerate route, so neither re-runs collection
 * or evidence extraction. With `regenerateField`, only that field is refreshed
 * (merged into the latest generation's output) — the cheap single-block regen.
 */
export async function runGeneration(
  scanId: string,
  type: GenerationType,
  opts?: { regenerateField?: string }
): Promise<RunGenerationResult> {
  const [scan] = await db
    .select()
    .from(scans)
    .where(eq(scans.id, scanId))
    .limit(1);
  if (!scan) throw new Error(`Scan ${scanId} not found`);
  if (!scan.evidence) {
    throw new Error(`Scan ${scanId} has no evidence — run the scan first`);
  }

  const config = scanConfigSchema.parse(scan.config);
  const evidence: Evidence = evidenceSchema.parse(scan.evidence);

  let result;
  switch (type) {
    case "linkedin":
      result = await generateLinkedIn(evidence, config);
      break;
    case "cv":
      result = await analyzeCv(evidence, await latestCvText(scan.userId), config);
      break;
    case "linkedin_audit":
      result = await auditLinkedIn(
        evidence,
        await latestLinkedInProfile(scan.userId),
        config
      );
      break;
    default:
      throw new Error(`Unknown generation type: ${type}`);
  }

  let output = result.output as Record<string, unknown>;

  if (opts?.regenerateField) {
    const field = opts.regenerateField;
    const [existing] = await db
      .select()
      .from(generations)
      .where(and(eq(generations.scanId, scanId), eq(generations.type, type)))
      .orderBy(desc(generations.createdAt))
      .limit(1);
    if (existing?.output && typeof existing.output === "object") {
      output = {
        ...(existing.output as Record<string, unknown>),
        [field]: (result.output as Record<string, unknown>)[field],
      };
    }
  }

  const [inserted] = await db
    .insert(generations)
    .values({
      scanId,
      type,
      provider: result.provider,
      model: result.model,
      prompt: result.prompt,
      rawResponse: result.rawResponse,
      output: output as never,
    })
    .returning({ id: generations.id });

  return { generationId: inserted.id, type, output };
}

async function latestCvText(userId: string): Promise<string> {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt))
    .limit(1);
  if (!doc) {
    throw new Error("No CV uploaded — upload a CV before running a CV analysis");
  }
  return doc.extractedText;
}

async function latestLinkedInProfile(userId: string): Promise<unknown> {
  const [imp] = await db
    .select()
    .from(linkedinImports)
    .where(eq(linkedinImports.userId, userId))
    .orderBy(desc(linkedinImports.createdAt))
    .limit(1);
  if (!imp) {
    throw new Error(
      "No LinkedIn import found — import your profile before running an audit"
    );
  }
  return imp.data;
}
