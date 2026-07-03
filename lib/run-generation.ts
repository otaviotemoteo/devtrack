import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { scans, generations, documents, linkedinImports } from "@/db/schema";
import { evidenceSchema, type Evidence } from "@/lib/ai/evidence";
import { generateLinkedIn } from "@/lib/ai/generators/linkedin";
import { analyzeCv } from "@/lib/ai/generators/cv";
import { auditLinkedIn } from "@/lib/ai/generators/linkedin-audit";
import { scanConfigSchema, type ScanConfig } from "@/lib/scan/config";
import { getOrCreateProfile, seedExperiences } from "@/lib/profile";
import { experienceDraftSchema } from "@/lib/experiences";
import { z } from "zod";

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
  const effectiveConfig = await mergeProfileContext(scan.userId, config);

  let result;
  switch (type) {
    case "linkedin":
      result = await generateLinkedIn(evidence, effectiveConfig);
      break;
    case "cv":
      result = await analyzeCv(
        await latestCvText(scan.userId),
        effectiveConfig,
        evidence
      );
      break;
    case "linkedin_audit":
      result = await auditLinkedIn(
        await latestLinkedInProfile(scan.userId),
        effectiveConfig,
        evidence
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
      userId: scan.userId,
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

/**
 * Standalone Stage 2 — CV/audit generation without a scan. The latest stored
 * Evidence (if any) is passed as optional enrichment; the generators degrade
 * gracefully without it. Never creates or writes evidence — the GitHub scan
 * is the only evidence producer.
 */
export async function runStandaloneGeneration(
  userId: string,
  type: Extract<GenerationType, "cv" | "linkedin_audit">,
  config: ScanConfig
): Promise<RunGenerationResult> {
  const evidence = await getLatestEvidence(userId);
  const effectiveConfig = await mergeProfileContext(userId, config);

  let result;
  if (type === "cv") {
    result = await analyzeCv(
      await latestCvText(userId),
      effectiveConfig,
      evidence ?? undefined
    );
    // Pre-fill the profile's experience cards from what the analysis found in
    // the CV — profile context only (fills an empty list, never evidence).
    await trySeedExperiences(
      userId,
      (result.output as { extractedExperiences?: unknown }).extractedExperiences,
      "cv"
    );
  } else {
    const profile = await latestLinkedInProfile(userId);
    // Same pre-fill from the structured positions in the LinkedIn import.
    await trySeedExperiences(
      userId,
      (profile as { experience?: unknown })?.experience,
      "linkedin"
    );
    result = await auditLinkedIn(profile, effectiveConfig, evidence ?? undefined);
  }

  const [inserted] = await db
    .insert(generations)
    .values({
      userId,
      scanId: null,
      type,
      provider: result.provider,
      model: result.model,
      prompt: result.prompt,
      rawResponse: result.rawResponse,
      output: result.output as never,
    })
    .returning({ id: generations.id });

  return {
    generationId: inserted.id,
    type,
    output: result.output as Record<string, unknown>,
  };
}

/**
 * Merge standing profile context as defaults — it's the default context for
 * every generator. Config-time values win over profile values.
 */
async function mergeProfileContext(
  userId: string,
  config: ScanConfig
): Promise<ScanConfig> {
  const profile = await getOrCreateProfile(userId);
  const mergedInstructions = [profile.extraInstructions, config.extraInstructions]
    .filter(Boolean)
    .join("\n\n");
  return {
    ...config,
    targetRole: config.targetRole ?? profile.targetRole ?? undefined,
    industry: config.industry ?? profile.industry ?? undefined,
    situation: config.situation ?? profile.situation ?? undefined,
    currentRole: config.currentRole ?? profile.currentRole ?? undefined,
    currentCompany: config.currentCompany ?? profile.currentCompany ?? undefined,
    currentSince: config.currentSince ?? profile.currentSince ?? undefined,
    projects: config.projects ?? profile.projects ?? undefined,
    experiences:
      config.experiences ??
      (profile.experiences.length > 0 ? profile.experiences : undefined),
    extraInstructions: mergedInstructions || undefined,
  };
}

/**
 * Best-effort experience pre-fill: loosely validate whatever the import/AI
 * produced and hand it to `seedExperiences` (which only fills an empty list).
 * Never lets a seeding problem fail the generation.
 */
async function trySeedExperiences(
  userId: string,
  raw: unknown,
  source: "linkedin" | "cv"
): Promise<void> {
  try {
    const parsed = z.array(experienceDraftSchema).safeParse(raw);
    if (parsed.success) await seedExperiences(userId, parsed.data, source);
  } catch {
    // Profile enrichment only — the generation result matters more.
  }
}

/**
 * Latest stored Evidence for the user, or null. Read-only — CV/audit call
 * this for optional grounding; they never produce evidence.
 */
export async function getLatestEvidence(
  userId: string
): Promise<Evidence | null> {
  const scan = await getLatestEvidenceScan(userId);
  return scan ? evidenceSchema.parse(scan.evidence) : null;
}

/** Most recent scan that has stored evidence — the only evidence source. */
async function getLatestEvidenceScan(userId: string) {
  const [scan] = await db
    .select()
    .from(scans)
    .where(and(eq(scans.userId, userId), isNotNull(scans.evidence)))
    .orderBy(desc(scans.createdAt))
    .limit(1);
  return scan ?? null;
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
