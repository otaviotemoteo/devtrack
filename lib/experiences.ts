import { z } from "zod";

/**
 * A user-managed work experience shown as an editable card on /profile.
 * Pre-filled (confirmed=false) from the LinkedIn export or CV analysis via
 * `seedExperiences`, then owned by the user. This is profile context, NOT
 * evidence — the GitHub scan remains the only evidence producer.
 *
 * Kept free of db/server imports so client components can import the type.
 */
export const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().max(200),
  role: z.string().max(200),
  period: z.string().max(100),
  description: z.string().max(1000),
  source: z.enum(["linkedin", "cv", "manual"]),
  confirmed: z.boolean(),
});

export type Experience = z.infer<typeof experienceSchema>;

/** Raw position shape produced by the LinkedIn export parse / CV extraction. */
export interface ExperienceDraft {
  company: string;
  role: string;
  period: string;
  description: string;
}

export const experienceDraftSchema = z.object({
  company: z.string(),
  role: z.string(),
  period: z.string(),
  description: z.string(),
});
