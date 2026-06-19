import { z } from "zod";

/**
 * ScanConfig — the answers collected by the onboarding form.
 * Mirrors the onboarding UI: sources to scan, an optional time range,
 * who the content is for (global profile vs a specific company), and the
 * output language.
 */
export const scanConfigSchema = z.object({
  // Legacy onboarding sources. The /scan/new screen drives selection via
  // `selectedRepoIds`, so this is optional now (kept for the legacy ScanForm).
  sources: z
    .object({
      // Scan the user's own repositories.
      personalProjects: z.boolean(),
      // Scan contributions made to organizations.
      orgContributions: z.boolean(),
      // Specific org logins to limit to. Empty = all orgs.
      orgs: z.array(z.string()).default([]),
    })
    .optional(),

  // "YYYY-MM" strings. Omit/empty to scan all time.
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM")
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM")
    .optional(),

  // Who the generated content is tailored for.
  target: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("global") }),
    z.object({
      kind: z.literal("company"),
      company: z.string().min(1, "Company name is required"),
      role: z.string().optional(),
      period: z.string().optional(),
    }),
  ]),

  // Output language for the generated content.
  language: z.enum(["pt", "en"]).default("en"),

  // Pre-scan repo selection. `repositories.id` list; if absent, the scan falls
  // back to all repos flagged `selected = true` for the user.
  selectedRepoIds: z.array(z.string()).optional(),

  // Per-organization emphasis notes (org login → note), gathered on /scan/new
  // and folded into evidence extraction as extra signal.
  orgEmphasis: z.record(z.string()).optional(),

  // Free-text instructions to shape the generated output sections.
  extraInstructions: z.string().max(2000).optional(),

  // Standing profile context, merged from profile_settings at generation time.
  targetRole: z.string().optional(),
  industry: z.string().optional(),

  // Which generator runs in stage 2 of the harness.
  generationType: z.enum(["linkedin", "cv", "linkedin_audit"]).default("linkedin"),
});

export type ScanConfig = z.infer<typeof scanConfigSchema>;
