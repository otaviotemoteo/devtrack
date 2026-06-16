import { generateObject } from "ai";
import { z } from "zod";
import { aiProvider, resolveModel } from "./provider";
import { COMPLIANCE_RULES } from "./shared";
import type { GitHubActivity } from "@/lib/github/collect";
import type { ScanConfig } from "@/lib/scan/config";

// Flat by design (Gemini reliability). This is the reusable substrate every
// generator writes from — the main quality lever of the harness.
export const evidenceSchema = z.object({
  themes: z
    .array(z.string())
    .describe("Overarching themes across the work (3-7)"),
  projects: z
    .array(
      z.object({
        name: z.string().describe("Project / product name"),
        summary: z
          .string()
          .describe("1-2 line distilled contribution, noise removed"),
        impact: z.string().optional().describe("Concrete outcome if evident"),
        repo: z.string().describe("Proof source (repo full name)"),
        commitCount: z.number().optional(),
      })
    )
    .describe("Distinct projects, clustered from the activity"),
  skills: z
    .array(
      z.object({
        name: z.string(),
        evidence: z
          .string()
          .describe("Why this skill is supported by the data"),
      })
    )
    .describe("Skills grounded in the activity"),
  timeline: z.string().optional().describe("Brief span/cadence of the work"),
});

export type Evidence = z.infer<typeof evidenceSchema>;

export interface ExtractEvidenceInput {
  collectedData: GitHubActivity;
  /** Map of repo fullName -> user-provided context note. */
  repoContext: Record<string, string>;
  config: ScanConfig;
}

export interface EvidenceResult {
  evidence: Evidence;
  provider: string;
  model: string;
  prompt: string;
  rawResponse: string;
}

/**
 * STAGE 1 — distill noisy GitHub activity into structured, auditable Evidence.
 * Runs once per scan; all generators read from the stored result.
 */
export async function extractEvidence({
  collectedData,
  repoContext,
  config,
}: ExtractEvidenceInput): Promise<EvidenceResult> {
  const { provider, model } = aiProvider();

  const systemPrompt = `You are an analyst distilling a software engineer's raw GitHub activity into clean, factual evidence of their work.
Rules:
- Filter out noise: ignore merge commits, chores, "wip", typo fixes, formatting-only, and dependency bumps.
- Cluster commits and pull requests by the project/repo they belong to.
- Only claim what the data supports. Do not invent impact or numbers.
- Fold each repo's user-provided context note in as extra signal about purpose and impact.
${COMPLIANCE_RULES}
- Be concise and concrete.`;

  const repoContextLines = Object.entries(repoContext)
    .filter(([, note]) => note?.trim())
    .map(([repo, note]) => `- ${repo}: ${note.trim()}`)
    .join("\n");

  const userPrompt = `Raw GitHub activity (commits + pull requests):
${JSON.stringify(collectedData, null, 2)}

Per-repo context notes from the user:
${repoContextLines || "(none provided)"}`;

  try {
    const { object } = await generateObject({
      model: resolveModel(),
      schema: evidenceSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    });

    return {
      evidence: object,
      provider,
      model,
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      rawResponse: JSON.stringify(object),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Evidence extraction failed: ${message}`);
  }
}
