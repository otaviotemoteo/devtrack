---
name: spec-acceptance
description: Walk the acceptance criteria in ADJUSTMENTS-onboarding-harness.md against the live code and report pass/fail per item with file evidence. Use to confirm the onboarding/harness spec is (still) fully satisfied.
---

# Spec acceptance walk

Check every acceptance criterion in `ADJUSTMENTS-onboarding-harness.md` (repo root) against the
current code. For each, cite the file(s) proving it and mark **PASS** / **FAIL** / **PARTIAL**.

## The criteria (verify against the spec file — it is the source of truth)

1. Sign-in requests only `read:user user:email`; profile auto-provisioned from GitHub, no
   manual fields before the picker. → `auth.ts` scope, `lib/profile.ts`, `/start` flow.
2. Repo scope (`repo read:org`) requested only at scan start via incremental consent; CV and
   audit never trigger it. → `components/scan/connect-repos.tsx`, grep CV/audit paths for scope.
3. Starting a scan without `repo` runs the connect-repositories step first, then proceeds.
   → `app/scan/new/page.tsx` gate + callback URL round-trip.
4. `analyzeCv` and `auditLinkedIn` run with AND without evidence; grounding block present only
   when evidence exists; absent runs never reference GitHub. → generators + `groundingBlock`.
5. Build LinkedIn / New scan still require and use evidence; CV / audit work standalone.
   → `runGeneration` throws without evidence; `runStandaloneGeneration` exists and is wired.
6. Evidence-less CV/audit results show the soft scan CTA; never blocks the result.
   → `EnrichmentUpsell` in `app/cv/[id]` + `app/linkedin/[id]`, marker-based detection.
7. Profile completion card only when targetRole/industry empty; dismissible with persistence
   ("skip for now" doesn't re-nag); never blocks; collapses once filled.
   → `CompletionCard`, `profileSettings.contextPromptDismissed`, PATCH `/api/profile`.

## Method

- Read the spec file first — if its criteria differ from the list above, follow the spec.
- For each criterion, read the cited files (and grep for counter-evidence, e.g. a stray 409
  gate or a repo-scope request in a CV path).
- Where behavior can't be proven statically (OAuth round-trips, AI output), say what manual
  test would prove it instead of guessing.

## Output

A checklist table: criterion → verdict → evidence (file:line). Then a short list of anything
needed to reach full PASS.
