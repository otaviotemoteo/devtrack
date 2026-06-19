import { generateObject } from "ai";
import { z } from "zod";
import { aiProvider, resolveModel } from "../provider";
import {
  COMPLIANCE_RULES,
  cleanList,
  profileContextLines,
  languageLabel,
  targetLine,
} from "../shared";
import type { Evidence } from "../evidence";
import type { ScanConfig } from "@/lib/scan/config";

// Kept intentionally flat (one shallow array of experience items) — Gemini's
// structured output is less reliable with deeply nested schemas.
export const linkedinOutputSchema = z.object({
  headline: z.string().describe("LinkedIn profile headline (max 220 chars)"),
  about: z
    .string()
    .describe("LinkedIn About section (first person, max ~2000 chars)"),
  skills: z.array(z.string()).describe("8-12 concise skills, no '#'"),
  experience: z
    .array(
      z.object({
        company: z.string().describe("Company or project name"),
        role: z.string().describe("Role / title"),
        period: z.string().describe("e.g. '2023 – now'"),
        description: z.string().describe("Impact-focused bullet paragraph"),
      })
    )
    .describe("Experience entries derived from the evidence"),
});

export type LinkedInOutput = z.infer<typeof linkedinOutputSchema>;

export interface GeneratorResult<T> {
  output: T;
  provider: string;
  model: string;
  prompt: string;
  rawResponse: string;
}

/** STAGE 2 — write recruiter-ready LinkedIn content from the Evidence. */
export async function generateLinkedIn(
  evidence: Evidence,
  config: ScanConfig
): Promise<GeneratorResult<LinkedInOutput>> {
  const { provider, model } = aiProvider();

  const systemPrompt = `You are a professional LinkedIn content writer.
Turn the distilled evidence of the user's work into engaging, recruiter-ready LinkedIn content.
Rules:
- Write everything in ${languageLabel(config)}.
- ${targetLine(config)}
${COMPLIANCE_RULES}
- Write in first person, professional but human tone.

Example (anonymized, for tone calibration only):
Headline: "Backend engineer • distributed systems • I make slow services fast"
About excerpt: "I build the unglamorous parts that keep products up: queues, caches, and the boring reliability work users never see but always feel."${profileContextLines(
    config
  )}`;

  const userPrompt = `Evidence to write from:\n${JSON.stringify(
    evidence,
    null,
    2
  )}`;

  try {
    const { object } = await generateObject({
      model: resolveModel(),
      schema: linkedinOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.5,
    });

    const output: LinkedInOutput = {
      ...object,
      skills: cleanList(object.skills),
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
    throw new Error(`LinkedIn generation failed: ${message}`);
  }
}
