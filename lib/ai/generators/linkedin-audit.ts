import { generateObject } from "ai";
import { z } from "zod";
import { aiProvider, resolveModel } from "../provider";
import {
  COMPLIANCE_RULES,
  cleanList,
  extraInstructionsLine,
  languageLabel,
} from "../shared";
import type { Evidence } from "../evidence";
import type { GeneratorResult } from "./linkedin";
import type { ScanConfig } from "@/lib/scan/config";

// Flat schema — audits an imported LinkedIn profile against the GitHub Evidence.
export const auditOutputSchema = z.object({
  score: z.number().describe("0-100 overall profile strength score"),
  gaps: z
    .array(
      z.object({
        section: z.string().describe("Profile section, e.g. 'Headline'"),
        gap: z.string().describe("What's weak or missing"),
        suggestion: z.string().describe("Concrete improvement"),
      })
    )
    .describe("Section-by-section gaps"),
  improvedHeadline: z.string(),
  improvedAbout: z.string(),
  suggestedSkills: z
    .array(z.string())
    .describe("Skills proven by evidence but missing/weak on the profile"),
  experienceRewrites: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        improvedBullets: z.array(z.string()),
      })
    )
    .describe("Stronger experience bullets per role"),
});

export type AuditOutput = z.infer<typeof auditOutputSchema>;

/**
 * STAGE 2 — audit an imported LinkedIn profile against the GitHub Evidence and
 * return section-by-section gaps plus improved copy.
 */
export async function auditLinkedIn(
  evidence: Evidence,
  profile: unknown,
  config: ScanConfig
): Promise<GeneratorResult<AuditOutput>> {
  const { provider, model } = aiProvider();

  const systemPrompt = `You are a LinkedIn profile strategist for software engineers.
Audit the user's current LinkedIn profile and strengthen it using verified evidence of their GitHub work.
Rules:
- Write everything in ${languageLabel(config)}.
- Identify concrete gaps section by section (headline, about, experience, skills).
- Use the GitHub evidence to add credible, specific substance — never fabricate.
${COMPLIANCE_RULES}
- Keep rewrites first-person, professional, and human.

Example gap (anonymized, for calibration): { "section": "Headline", "gap": "Generic title with no specialization or value.", "suggestion": "Name the domain and the outcome: 'Platform engineer • CI/CD • ship 5x faster'." }${extraInstructionsLine(
    config
  )}`;

  const userPrompt = `Verified GitHub evidence:
${JSON.stringify(evidence, null, 2)}

Current LinkedIn profile (normalized):
${JSON.stringify(profile, null, 2)}`;

  try {
    const { object } = await generateObject({
      model: resolveModel(),
      schema: auditOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.4,
    });

    const output: AuditOutput = {
      ...object,
      suggestedSkills: cleanList(object.suggestedSkills),
    };

    return {
      output,
      provider,
      model,
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      rawResponse: JSON.stringify(object),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`LinkedIn audit failed: ${message}`);
  }
}
