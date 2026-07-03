import type { ScanConfig } from "@/lib/scan/config";
import type { Evidence } from "./evidence";

/** Compliance guardrails shared by every generator's system prompt. */
export const COMPLIANCE_RULES = `- Never expose client names, internal or secret project names, or credentials.
- Focus on impact and outcomes, not sensitive low-level technical detail.
- Only claim what the provided evidence supports — never invent experience.`;

export function languageLabel(config: ScanConfig): string {
  return config.language === "pt" ? "Brazilian Portuguese" : "English";
}

export function targetLine(config: ScanConfig): string {
  return config.target.kind === "company"
    ? `Tailor the content for an application to "${config.target.company}"${
        config.target.role ? ` for the role of "${config.target.role}"` : ""
      }${config.target.period ? ` (${config.target.period})` : ""}.`
    : "Write for the user's general public profile (no specific company).";
}

export function extraInstructionsLine(config: ScanConfig): string {
  return config.extraInstructions
    ? `\n\nAdditional user instructions (honor these): ${config.extraInstructions}`
    : "";
}

/**
 * Standing profile context (target role / industry / extra instructions) fed
 * into every generator's system prompt. Sourced from profile_settings and
 * merged into the config by `runGeneration`.
 */
export function profileContextLines(config: ScanConfig): string {
  const parts: string[] = [];
  if (config.situation === "employed") {
    const where = config.currentCompany ? ` at ${config.currentCompany}` : "";
    const since = config.currentSince ? ` (since ${config.currentSince})` : "";
    parts.push(
      config.currentRole
        ? `Currently working as ${config.currentRole}${where}${since} — sharpen how existing experience is presented.`
        : `Currently employed${where}${since} — sharpen how existing experience is presented.`
    );
  } else if (config.situation === "searching") {
    parts.push("Actively looking for a job — angle content toward landing the target role.");
  } else if (config.situation === "student") {
    parts.push("Student / early career, little or no formal experience — lean on projects and learning.");
  }
  if (config.targetRole) parts.push(`Target role: ${config.targetRole}`);
  if (config.industry) parts.push(`Industry: ${config.industry}`);
  for (const exp of (config.experiences ?? []).slice(0, 5)) {
    const period = exp.period ? ` (${exp.period})` : "";
    parts.push(`Work experience (user-provided): ${exp.role} at ${exp.company}${period}`);
  }
  if (config.projects) {
    parts.push(`Projects (user-described): ${config.projects}`);
  }
  if (config.extraInstructions) {
    parts.push(`Additional user instructions (honor these): ${config.extraInstructions}`);
  }
  return parts.length ? `\n\nProfile context:\n- ${parts.join("\n- ")}` : "";
}

/**
 * Conditional grounding block: GitHub Evidence as optional enrichment.
 * Present → the generator cross-references the artifact against real work.
 * Absent → returns "" and the prompt must not reference GitHub at all.
 * The marker string is also how result pages detect evidence-less runs
 * (generations.prompt is persisted for audit).
 */
export const GROUNDING_MARKER = "GROUNDING EVIDENCE";

export function groundingBlock(evidence?: Evidence): string {
  if (!evidence) return "";
  return `\n\n${GROUNDING_MARKER} (the user's real GitHub work — cross-reference the artifact against it: reinforce claims it can prove, and surface what it shows that the artifact is missing):\n${JSON.stringify(
    evidence,
    null,
    2
  )}`;
}

/** Trim, drop empties, dedupe (case-insensitive), and cap a string list. */
export function cleanList(items: string[], max = 20): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= max) break;
  }
  return out;
}
