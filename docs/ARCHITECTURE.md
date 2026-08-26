# Architecture

How DevTrack is built and why. The rules here are binding: a change that
contradicts one of them either follows the rule or changes it here first.

---

## The core flow

```
Landing → Login (GitHub OAuth, identity only) → /start picker (three features, no form)
        → the chosen flow collects what it needs, in context
```

There is no settings form up front. Each of the three features asks for what it
needs at the moment it needs it, which is why the first screen after sign-in is
a picker and not a wizard.

**1. Build my LinkedIn / New scan.** Incremental repo consent, repo selection,
scan, evidence, generation. This is the only place evidence is produced.

**2. Improve my CV.** Upload, analyze. No repo access, ever. Reads existing
evidence if there is any, read-only.

**3. LinkedIn audit.** Import a profile export `.zip`, audit it. Same rules: no
repo access, evidence read-only.

LinkedIn output is always copy and paste, never an automated edit. The official
profile-edit API is gated behind an enterprise partner program that is not
available here, so the product generates text and says where to paste it. That
is a constraint, not a phase.

---

## Layering

1. **Data** (`db/`): schema and the Drizzle client. No business logic.
2. **Services** (`lib/`): all business logic. Services are framework-agnostic.
   They must not import from `next/*`, must not know anything about HTTP, and
   receive their dependencies as arguments (the GitHub token, the config). That
   is what keeps them testable and reusable from a script or a CLI later.
3. **API routes** (`app/api/`): thin controllers. A route checks auth, validates
   input with Zod, calls a service, and maps the result or error to a status
   code. No business logic. A route that grows logic gets it extracted.
4. **UI** (`app/`, `components/`): Server Components by default. `"use client"`
   only where there is real interactivity: polling, copy buttons, form state.

---

## Two-tier GitHub OAuth

Least privilege, split across two moments.

- **Sign-in** requests identity only: `read:user,user:email`, a static scope in
  `auth.ts`.
- **Repo access** (`repo,read:org`) is requested lazily through incremental
  consent, and only when a scan is being started. `/scan/new` checks
  `hasRepoScope(userId)` (`lib/github/scope.ts`) and renders `ConnectRepos`
  (`components/scan/connect-repos.tsx`), which re-runs `signIn("github", …)`
  with the elevated scope. `POST /api/scans` re-checks server-side and answers
  403 without it.
- The CV and LinkedIn-audit flows must never trigger repo consent, and must
  never check repo scope.

**One gap to know about, and not to remove.** The Drizzle adapter persists OAuth
tokens only on the first account link. The `signIn` callback in `auth.ts`
manually upserts `access_token`, `scope` and the rest on every callback. Without
it, the token issued by the incremental-consent flow is silently dropped and the
scan fails with credentials that look present and are stale.

---

## The conditional-evidence harness

**Evidence is produced in exactly one place**: the GitHub scan, via `runScan` →
`extractEvidence` → `scans.evidence`. The CV and audit flows read it through
`getLatestEvidence(userId)` in `lib/run-generation.ts`. They never write it.

**The application's only job here is include or omit.** There is no
cross-feature comparison engine and no consistency-checking code. If evidence
exists, `groundingBlock(evidence)` (`lib/ai/shared.ts`) drops a
`GROUNDING EVIDENCE` block into the system prompt and the model does the
reasoning. If it does not exist, the block is omitted and the prompt explicitly
forbids referencing or inventing GitHub work.

Two generation paths:

- **Scan-anchored.** `runGeneration(scanId, type)` requires `scans.evidence` and
  throws without it. Used by `runScan` and by the regenerate route.
  `generations.scanId` is set.
- **Standalone.** `runStandaloneGeneration(userId, "cv" | "linkedin_audit",
  config)` treats evidence as optional through `getLatestEvidence`. Used by the
  direct `/cv` and `/linkedin` entry points. `generations.scanId` is NULL, which
  is how a result page knows it is standalone. An evidence-less run is detected
  by the absence of the `GROUNDING EVIDENCE` marker in the persisted
  `generations.prompt`.

Generator signatures encode the same rule: `generateLinkedIn(evidence, config)`
takes evidence as required, because the output is inherently GitHub-derived,
while `analyzeCv(cvText, config, evidence?)` and `auditLinkedIn(profile, config,
evidence?)` take it as optional.

An evidence-less CV or audit result shows a dismissible `EnrichmentUpsell`
pointing at the scan, because the scan is where richness comes from. It never
gates the result.

---

## Onboarding and profile

- **Picker first.** Sign-in leads to `/start` (`PathPicker`), shown once until
  the account is marked onboarded. No form.
- **Auto-provision.** `getOrCreateProfile` (`lib/profile.ts`) lazily caches the
  GitHub handle and suggests a target role and industry from the bio and company
  fields. Only when they are empty, never overwriting an edit, never blocking.
- **Deferred completion.** `/profile` shows a `CompletionCard` only while target
  role and industry are empty, and "Skip for now" persists through
  `profileSettings.contextPromptDismissed`. Never a gate: generators run fine
  with those fields empty, the same graceful degradation the evidence harness
  uses.

---

## Scan execution

`POST /api/scans` checks repo scope (403 without it), creates the `scans` row
with `status: pending`, then starts `runScan` **without awaiting it** and returns
`{ scanId }` immediately. `runScan` writes progress into the row as it goes: 0 to
60 during collection, 80 after evidence, 100 after generation. The client polls
`GET /api/scans/[id]` about every 1.5 seconds and redirects to `/results/[id]`
when the status reaches `done`.

**The rule that comes with that pattern:** the scan needs a long-lived process,
which means local development or a VPS. On serverless the function can freeze
once it has responded, which kills the work that was deliberately not awaited. A
job queue is the correct production answer and is out of scope: do not add one
unless it has been asked for.

---

## Model handler rules

- Provider resolution in `lib/ai/provider.ts` reads from the environment
  (`AI_PROVIDER`, `AI_MODEL`). Calling code never hardcodes a provider. Adding
  one is a new `case` in `resolveModel`.
- Always `generateObject` with a Zod output schema. Keep the schemas **flat**:
  Gemini's structured output gets less reliable as nesting grows. Wrap the calls
  in try/catch.
- Compliance guardrails live in `COMPLIANCE_RULES` (`lib/ai/shared.ts`): never
  expose client names, internal or secret project details, or credentials. The
  generated text talks about impact, not sensitive technical detail.
- Evidence reaches a prompt through `groundingBlock()` and nowhere else. Do not
  hand-roll the JSON interpolation.

---

## Conventions

- **Naming.** Every file is lowercase kebab-case (`run-scan.ts`,
  `copy-block.tsx`). Exported symbols are PascalCase, functions and variables
  camelCase.
- **Validation at the boundary.** Every request body is parsed with its Zod
  schema in the route before use. Client input is never trusted.
- **Errors.** Services throw. Routes catch and map to status codes. `runScan`
  catches everything and writes `status: "error"` plus the message to the row,
  because an unhandled throw in a fire-and-forget has nowhere to go.
- **Secrets.** GitHub tokens and model keys are server-only, never sent to the
  client. No environment variable gets a `NEXT_PUBLIC_` prefix unless it is
  genuinely public. Anything importing `db` is server-only and must never be
  imported from a `"use client"` component.
- **One source of truth: the database.** No client-side persistence, no
  localStorage. Progress is read from the `scans` row by polling.
- **Auditability.** Every scan persists its config, the raw collected data and
  the evidence. Every generation persists the provider, the model, the prompt
  and the raw response. These are not optional, and the persisted prompt is also
  the mechanism that detects evidence-less runs, so the `GROUNDING EVIDENCE`
  marker has to stay stable.
- **One component per file.** Components stay presentational. Data is fetched in
  Server Components and passed down as props, never inside a deep client
  component.

---

## Adding a feature

A new output type reuses the same spine, evidence plus the model handler:

1. A new flat output schema and a `generateX()` function in
   `lib/ai/generators/`. Copy the `cv.ts` pattern, including its optional
   evidence handling if the feature can run standalone.
2. Save to `generations` with its `type`, adding to the enum if needed.
3. A new route and a view.

Do not touch collection or auth. Do not add infrastructure.

**Out of scope, deliberately:** automated LinkedIn editing, multi-user roles, a
job queue, and downloading git diffs.

---

## Key modules

| File | Role |
|---|---|
| `db/schema.ts` | `scans`, `generations`, `repositories`, `documents`, `linkedin_imports`, `profile_settings`, `audit_logs` |
| `lib/scan/config.ts` | The Zod `ScanConfig` |
| `lib/github/collect.ts` | `collectGitHubActivity(token, targets, config, onProgress)` |
| `lib/github/scope.ts` | `hasRepoScope(userId)`, the two-tier OAuth gate |
| `lib/ai/evidence.ts` | `evidenceSchema` and `extractEvidence`, stage one, scan only |
| `lib/ai/shared.ts` | `COMPLIANCE_RULES`, `groundingBlock`, `GROUNDING_MARKER`, prompt helpers |
| `lib/ai/generators/` | `generateLinkedIn(evidence, config)`, `analyzeCv(cvText, config, evidence?)`, `auditLinkedIn(profile, config, evidence?)` |
| `lib/run-scan.ts` | The scan orchestrator: collect, evidence, generation |
| `lib/run-generation.ts` | `runGeneration`, `runStandaloneGeneration`, `getLatestEvidence` |
| `lib/profile.ts` | `getOrCreateProfile`, auto-provision from the GitHub profile |
