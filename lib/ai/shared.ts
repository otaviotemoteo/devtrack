import type { ScanConfig } from "@/lib/scan/config";

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
