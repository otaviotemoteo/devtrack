import { generateObject } from "ai";
import { z } from "zod";
import { aiProvider, resolveModel } from "../provider";
import {
  COMPLIANCE_RULES,
  cleanList,
  profileContextLines,
  languageLabel,
} from "../shared";
import type { Evidence } from "../evidence";
import type { GeneratorResult } from "./linkedin";
import type { ScanConfig } from "@/lib/scan/config";

// Flat schema — cross-references the CV against the GitHub Evidence.
export const cvOutputSchema = z.object({
  score: z
    .number()
    .describe("0-100 overall CV quality / ATS-readiness score"),
  verdict: z
    .string()
    .describe("One-line summary verdict, e.g. 'Strong base — tighten the impact'"),
  strengths: z.array(z.string()).describe("What the CV already does well"),
  issues: z
    .array(
      z.object({
        area: z.string().describe("Section or aspect, e.g. 'Summary'"),
        problem: z.string(),
        fix: z.string().describe("Concrete, actionable fix"),
      })
    )
    .describe("Problems and how to fix them"),
  originalSummary: z
    .string()
    .describe("The CV's current professional summary, quoted (empty if none)"),
  improvedSummary: z.string().describe("Rewritten professional summary"),
  improvedBullets: z
    .array(
      z.object({
        original: z.string(),
        improved: z.string().describe("Stronger, impact-focused rewrite"),
      })
    )
    .describe("Before → after bullet rewrites"),
  missingKeywords: z
    .array(z.string())
    .describe(
      "Skills/keywords proven by GitHub evidence but absent from the CV"
    ),
});

export type CvOutput = z.infer<typeof cvOutputSchema>;

/**
 * STAGE 2 — analyze an uploaded CV against the GitHub Evidence and return an
 * actionable, ATS-aware before→after improvement.
 */
export async function analyzeCv(
  evidence: Evidence,
  cvText: string,
  config: ScanConfig
): Promise<GeneratorResult<CvOutput>> {
  const { provider, model } = aiProvider();

  const systemPrompt = `You are an expert technical recruiter and ATS (applicant tracking system) reviewer.
Analyze the candidate's CV and cross-reference it against verified evidence of their GitHub work.
Rules:
- Write everything in ${languageLabel(config)}.
- Reward quantified impact and clear, scannable structure; penalize vagueness, buzzwords, and ATS-hostile formatting.
- Surface "missing keywords": skills the GitHub evidence proves but the CV fails to mention.
- Ground every suggestion in either the CV text or the evidence — do not invent achievements.
${COMPLIANCE_RULES}

Example issue (anonymized, for calibration): { "area": "Experience", "problem": "Bullets describe duties, not outcomes ('responsible for the API').", "fix": "Lead with impact: 'Cut API p95 latency 40% by adding a read-through cache.'" }${profileContextLines(
    config
  )}`;

  const userPrompt = `Verified GitHub evidence:
${JSON.stringify(evidence, null, 2)}

CV text to analyze:
${cvText}`;

  try {
    const { object } = await generateObject({
      model: resolveModel(),
      schema: cvOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.4,
    });

    const output: CvOutput = {
      ...object,
      missingKeywords: cleanList(object.missingKeywords),
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
    throw new Error(`CV analysis failed: ${message}`);
  }
}
