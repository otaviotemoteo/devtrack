import { db } from "@/db";
import { scans, generations, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getGithubToken } from "@/lib/github/token";
import { collectGitHubActivity } from "@/lib/github/collect";
import { generateLinkedInContent } from "@/lib/ai";
import { scanConfigSchema } from "@/lib/scan/config";

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

    const onProgress = async (progress: number) => {
      await db.update(scans).set({ progress }).where(eq(scans.id, scanId));
    };

    const activity = await collectGitHubActivity(token, config, onProgress);

    await db
      .update(scans)
      .set({ rawData: activity as never, progress: 80 })
      .where(eq(scans.id, scanId));

    const result = await generateLinkedInContent(activity, config);

    await db.insert(generations).values({
      scanId,
      type: "linkedin",
      provider: result.provider,
      model: result.model,
      prompt: result.prompt,
      rawResponse: result.rawResponse,
      output: result.output as never,
    });

    await db
      .update(scans)
      .set({ status: "done", progress: 100 })
      .where(eq(scans.id, scanId));

    await db.insert(auditLogs).values({
      userId: scan.userId,
      action: "scan.completed",
      metadata: { scanId, provider: result.provider, model: result.model },
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
