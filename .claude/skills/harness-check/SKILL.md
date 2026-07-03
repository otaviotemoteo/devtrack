---
name: harness-check
description: Verify DevTrack's conditional-evidence and two-tier-OAuth invariants on the current diff or the whole codebase. Use after changes touching auth, scans, evidence, generators, or the CV/LinkedIn flows.
---

# Harness invariants check

Verify the invariants of the conditional-evidence harness and two-tier OAuth (see CLAUDE.md
sections "Two-tier GitHub OAuth" and "Conditional-evidence harness"). Scope: the current diff,
or the whole repo if the user asks for a full audit.

## Evidence invariants

1. **Single producer**: `scans.evidence` is written ONLY by the scan path
   (`lib/run-scan.ts` via `extractEvidence`). Grep for other writers — any `update`/`insert`
   touching `evidence` outside `run-scan.ts` is a violation.
2. **Read-only consumers**: CV and audit paths get evidence exclusively via
   `getLatestEvidence(userId)` and never write it.
3. **Include-or-omit only**: no cross-feature comparison/consistency-checking code. The app's
   only evidence logic is a boolean (exists → `groundingBlock`, absent → omitted).
4. **Conditional grounding**: in `lib/ai/generators/cv.ts` and `linkedin-audit.ts`, the
   `GROUNDING EVIDENCE` block (via `groundingBlock()` from `lib/ai/shared.ts`) appears iff
   `evidence` is passed; the evidence-less branch of the prompt explicitly forbids referencing
   or inventing GitHub work. No hand-rolled `JSON.stringify(evidence)` outside `groundingBlock`.
5. **`generateLinkedIn` still requires evidence** (non-optional first param) — it is inherently
   GitHub-derived.
6. **Marker stability**: `GROUNDING_MARKER` value unchanged — result pages detect evidence-less
   runs by its absence from the persisted `generations.prompt`.
7. **Standalone generations**: `runStandaloneGeneration` inserts `scanId: null` + `userId`;
   scan-anchored `runGeneration` still throws without `scan.evidence`.

## OAuth invariants

1. **Sign-in scope** in `auth.ts` is identity-only (`read:user,user:email`) — no `repo` there.
2. **`signIn` token-upsert callback present** in `auth.ts` (the Drizzle adapter drops upgraded
   tokens on relink without it). Its removal is a critical finding.
3. **Repo consent only in the scan flow**: `hasRepoScope` / `ConnectRepos` / elevated
   `signIn(..., { scope })` referenced only from `/scan/new` + `POST /api/scans`. Any repo-scope
   check or consent trigger in CV (`/cv`, `/api/cv`) or audit (`/linkedin`, `/api/linkedin/*`)
   paths is a violation.
4. **Server-side re-check**: `POST /api/scans` 403s without repo scope (UI gate is bypassable).
5. **No gating**: CV/audit routes never 409/redirect on missing evidence; the upsell CTA never
   blocks a result; the profile completion card never blocks a feature.

## Output

Report per invariant: **OK** / **VIOLATION** (file:line + fix) / **N/A** (not touched by the
diff). End with a one-line verdict. Report only — don't fix unless asked.
