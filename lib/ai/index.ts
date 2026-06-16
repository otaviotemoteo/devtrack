// Barrel for the two-stage AI harness. Keeps existing `@/lib/ai` imports working.
export { aiProvider, resolveModel } from "./provider";

export { evidenceSchema, extractEvidence } from "./evidence";
export type { Evidence, EvidenceResult, ExtractEvidenceInput } from "./evidence";

export { linkedinOutputSchema, generateLinkedIn } from "./generators/linkedin";
export type { LinkedInOutput, GeneratorResult } from "./generators/linkedin";

export { cvOutputSchema, analyzeCv } from "./generators/cv";
export type { CvOutput } from "./generators/cv";

export {
  auditOutputSchema,
  auditLinkedIn,
} from "./generators/linkedin-audit";
export type { AuditOutput } from "./generators/linkedin-audit";
