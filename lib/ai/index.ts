import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import type { GitHubActivity } from "@/lib/github/collect";
import type { ScanConfig } from "@/lib/scan/config";

// Kept intentionally flat (one shallow array of experience items) — Gemini's
// structured output is less reliable with deeply nested schemas.
export const linkedinOutputSchema = z.object({
  headline: z.string().describe("LinkedIn profile headline (max 220 chars)"),
  about: z.string().describe("LinkedIn About section (first person, max ~2000 chars)"),
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
    .describe("Experience entries derived from the activity"),
});

export type LinkedInOutput = z.infer<typeof linkedinOutputSchema>;

function resolveModel() {
  const provider = process.env.AI_PROVIDER ?? "google";
  const model = process.env.AI_MODEL ?? "gemini-2.0-flash";

  switch (provider) {
    case "google":
      return google(model);
    case "groq":
      return groq(model);
    default:
      throw new Error(`Unknown AI_PROVIDER: "${provider}". Supported: google, groq`);
  }
}

export async function generateLinkedInContent(
  activity: GitHubActivity,
  config: ScanConfig
): Promise<{
  output: LinkedInOutput;
  provider: string;
  model: string;
  prompt: string;
  rawResponse: string;
}> {
  const provider = process.env.AI_PROVIDER ?? "google";
  const model = process.env.AI_MODEL ?? "gemini-2.0-flash";

  const language = config.language === "pt" ? "Brazilian Portuguese" : "English";
  const targetLine =
    config.target.kind === "company"
      ? `Tailor the content for an application to "${config.target.company}"${
          config.target.role ? ` for the role of "${config.target.role}"` : ""
        }${config.target.period ? ` (${config.target.period})` : ""}.`
      : "Write for the user's general public profile (no specific company).";

  const systemPrompt = `You are a professional LinkedIn content writer.
Transform the provided GitHub activity into engaging, recruiter-ready LinkedIn content.
Rules:
- Write everything in ${language}.
- Focus on impact and outcomes, not low-level technical detail.
- ${targetLine}
- Never expose client names, internal/secret project names, or credentials.
- Write in first person, professional but human tone.`;

  const userPrompt = `GitHub activity to transform:\n${JSON.stringify(activity, null, 2)}`;

  const { object } = await generateObject({
    model: resolveModel(),
    schema: linkedinOutputSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  return {
    output: object,
    provider,
    model,
    prompt: `${systemPrompt}\n\n${userPrompt}`,
    rawResponse: JSON.stringify(object),
  };
}
