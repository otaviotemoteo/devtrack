import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { scans, auditLogs, repositories } from "@/db/schema";
import { getGithubToken } from "@/lib/github/token";
import { collectGitHubActivity, type CollectTarget } from "@/lib/github/collect";
import { extractEvidence } from "@/lib/ai/evidence";
import { runGeneration } from "@/lib/run-generation";
import { scanConfigSchema } from "@/lib/scan/config";

/**
 * Two-stage scan orchestration:
 *   resolve repos → collect (0-60) → extract evidence (60-80) → generate (80-100).
 * Catches everything and writes `status: "error"` to the row — never throws.
 */
export async function runScan(scanId: string): Promise<void> {
  try {
    const [scan] = await db
      .select()
      .from(scans)
      .where(eq(scans.id, scanId))
      .limit(1);
    if (!scan) throw new Error(`Scan ${scanId} not found`);

    await db
      .update(scans)
      .set({ status: "running", progress: 0 })
      .where(eq(scans.id, scanId));

    const config = scanConfigSchema.parse(scan.config);
    const token = await getGithubToken(scan.userId);

    // 1. Resolve the repos to scan + their per-repo context.
    const repoRows = await resolveSelectedRepos(scan.userId, config.selectedRepoIds);
    if (repoRows.length === 0) {
      throw new Error("No repositories selected for this scan");
    }
    const targets: CollectTarget[] = repoRows.map((r) => ({
      fullName: r.fullName,
      owner: r.owner,
      name: r.fullName.split("/")[1] ?? r.fullName,
    }));
    const repoContext: Record<string, string> = {};
    for (const r of repoRows) {
      if (r.userContext) repoContext[r.fullName] = r.userContext;
    }

    // 2. Collect GitHub activity (0 → 60). Rescale the collector's 0-100 band.
    const onProgress = async (p: number) => {
      await db
        .update(scans)
        .set({ progress: Math.round((p / 100) * 60) })
        .where(eq(scans.id, scanId));
    };
    const activity = await collectGitHubActivity(token, targets, config, onProgress);
    await db
      .update(scans)
      .set({ rawData: activity as never, progress: 60 })
      .where(eq(scans.id, scanId));

    // 3. Extract Evidence (60 → 80) and persist it for reuse by generators.
    const ev = await extractEvidence({
      collectedData: activity,
      repoContext,
      config,
    });
    await db
      .update(scans)
      .set({ evidence: ev.evidence as never, progress: 80 })
      .where(eq(scans.id, scanId));
    await db.insert(auditLogs).values({
      userId: scan.userId,
      action: "evidence.extracted",
      metadata: { scanId, provider: ev.provider, model: ev.model },
    });

    // 4. Generate (80 → 100) via the shared stage-2 service.
    const gen = await runGeneration(scanId, config.generationType);

    await db
      .update(scans)
      .set({ status: "done", progress: 100 })
      .where(eq(scans.id, scanId));
    await db.insert(auditLogs).values({
      userId: scan.userId,
      action: "scan.completed",
      metadata: { scanId, generationId: gen.generationId, type: gen.type },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(scans)
      .set({ status: "error", errorMessage: message })
      .where(eq(scans.id, scanId))
      .catch(() => {});
  }
}

/** Selected repo ids if provided, otherwise everything flagged `selected`. */
function resolveSelectedRepos(userId: string, selectedRepoIds?: string[]) {
  if (selectedRepoIds && selectedRepoIds.length > 0) {
    return db
      .select()
      .from(repositories)
      .where(
        and(
          eq(repositories.userId, userId),
          inArray(repositories.id, selectedRepoIds)
        )
      );
  }
  return db
    .select()
    .from(repositories)
    .where(
      and(eq(repositories.userId, userId), eq(repositories.selected, true))
    );
}
