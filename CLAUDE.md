# CLAUDE.md — DevTrack

Personal, single-user app. Scans my own GitHub activity (commits + PRs) and uses AI to
generate LinkedIn-ready content, plus CV analysis and LinkedIn-profile audits. Everything
runs on free tiers. This file is the project's constitution: follow it.

> Account/credential setup (GitHub OAuth, Google AI Studio, Neon) lives in
> `Guia de Construção` — not here. Assume those exist via env vars.

## Core flow

`Landing → Login (GitHub OAuth, identity-only) → /start picker (3 features, no form)
→ feature flow collects what it needs in context`

The three features:
1. **Build my LinkedIn / New scan** — incremental repo consent → repo selection → scan
   → evidence → generate. The scan is the ONLY producer of evidence.
2. **Improve my CV** — upload → analyze. No repo access, ever. Uses evidence only if it
   already exists (read-only).
3. **LinkedIn audit** — import export .zip → audit. Same: no repo access, evidence read-only.

LinkedIn is **copy-paste, never auto-edit** — the official profile-edit API is gated behind
an enterprise partner program we can't access. Generate text + tell the user where to paste it.

## Stack (locked — do not swap without being asked)

- **Next.js (App Router)** — frontend + API routes. No separate backend.
- **Auth.js v5 (next-auth)** + `@auth/drizzle-adapter` — GitHub OAuth, DB sessions.
- **Drizzle ORM + Neon** (Postgres). Dev: `drizzle-kit push`.
- **Vercel AI SDK (`ai`)** + `@ai-sdk/google` (default). Fallbacks: groq, openrouter.
- **Octokit** (`@octokit/rest`) for GitHub. **Lenis** for landing scroll. **Tailwind** + Zod.
- **pdf-parse / mammoth / adm-zip / papaparse** for CV + LinkedIn-export parsing.

## Two-tier GitHub OAuth (least privilege)

- **Sign-in** requests identity only: `read:user,user:email` (static scope in `auth.ts`).
- **Repo access** (`repo,read:org`) is requested lazily via **incremental consent**, only when
  starting a scan: `/scan/new` checks `hasRepoScope(userId)` (`lib/github/scope.ts`) and shows
  `ConnectRepos` (`components/scan/connect-repos.tsx`), which re-runs
  `signIn("github", ..., { scope: <elevated> })`. `POST /api/scans` re-checks server-side (403).
- **Auth.js gap (do not remove):** the Drizzle adapter only persists tokens on the FIRST
  account link. The `signIn` callback in `auth.ts` manually upserts
  `access_token`/`scope`/etc. on every OAuth callback — without it, the incremental-consent
  token is silently dropped.
- CV and LinkedIn-audit flows must NEVER trigger repo consent or check repo scope.

## Conditional-evidence harness

**Evidence is produced in exactly one place: the GitHub scan** (`runScan` → `extractEvidence`
→ `scans.evidence`). CV and audit only *read* it, via `getLatestEvidence(userId)` in
`lib/run-generation.ts` — they never write it.

**The app's only job is include-or-omit.** No cross-feature comparison engine, no
consistency-checking code. If evidence exists, `groundingBlock(evidence)` (`lib/ai/shared.ts`)
drops a `GROUNDING EVIDENCE` block into the system prompt and the model does the reasoning;
if not, the block is omitted and the prompt explicitly forbids referencing/inventing GitHub work.

Two generation paths:
- **Scan-anchored** — `runGeneration(scanId, type)`: requires `scans.evidence` (throws
  without it). Used by `runScan` and the regenerate route. `generations.scanId` set.
- **Standalone** — `runStandaloneGeneration(userId, "cv" | "linkedin_audit", config)`:
  evidence optional via `getLatestEvidence`. Used by direct `/cv` and `/linkedin` entry.
  `generations.scanId` is NULL (that's how result pages know it's standalone;
  evidence-less runs are detected by the `GROUNDING EVIDENCE` marker missing from the
  persisted `generations.prompt`).

Generator signatures: `generateLinkedIn(evidence, config)` (evidence REQUIRED — inherently
GitHub-derived), `analyzeCv(cvText, config, evidence?)`, `auditLinkedIn(profile, config, evidence?)`.

Evidence-less CV/audit results show a dismissible `EnrichmentUpsell` CTA pointing at the scan
(the scan is where richness comes from). It never gates the result.

## Onboarding & profile

- **Picker-first:** sign-in → `/start` (`PathPicker`, shown once until `onboarded`). No form.
- **Auto-provision:** `getOrCreateProfile` (`lib/profile.ts`) lazily caches `githubLogin` and
  suggests `targetRole`/`industry` from the GitHub bio/company — only when empty, never
  overwriting user edits, never blocking.
- **Deferred completion:** `/profile` shows a `CompletionCard` only while `targetRole`/`industry`
  are empty; "Skip for now" persists via `profileSettings.contextPromptDismissed`. Never a gate —
  generators run fine with these fields empty (same graceful degradation as evidence).

## Architecture — strict layering

1. **Data layer** (`db/`): schema + Drizzle client. No business logic.
2. **Services layer** (`lib/`): ALL business logic lives here. Services are framework-agnostic
   — they MUST NOT import from `next/*`, must not know about HTTP/requests, and receive their
   dependencies as arguments (e.g. the GitHub token, the config). This keeps them testable and
   reusable by future features, scripts, or a CLI.
3. **API routes** (`app/api/`): THIN controllers only. A route does exactly: check auth →
   validate input with Zod → call a service → map result/error to an HTTP response. **No business
   logic in routes.** If a route grows logic, extract it into a service.
4. **UI** (`app/`, `components/`): Server Components by default. `"use client"` only where
   there's real interactivity (polling, copy buttons, form state).

## Folder map

```
app/
├── page.tsx                 # landing (logged out) / dashboard (logged in)
├── login/page.tsx
├── start/page.tsx           # first-run 3-feature picker (once, until onboarded)
├── profile/page.tsx         # profile hub: sources, context form, completion card, history
├── cv/{page.tsx, [id]/page.tsx}          # upload → analyze; result view
├── linkedin/{page.tsx, [id]/page.tsx}    # import → audit; result view
├── scan/{new/page.tsx, [id]/page.tsx}    # scope gate + repo picker; progress (polling)
├── results/[id]/page.tsx    # LinkedIn generation copyable blocks
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── onboard/route.ts, profile/route.ts
    ├── cv/route.ts, linkedin/import/route.ts     # standalone generations
    ├── scans/{route.ts, [id]/route.ts}
    ├── repositories/{route.ts, sync/route.ts, [id]/route.ts}
    └── generations/route.ts  # scan-anchored regenerate
db/{schema.ts, auth-schema.ts, index.ts}
lib/
├── github/{collect.ts, token.ts, scope.ts, repos.ts}
├── ai/{provider.ts, shared.ts, evidence.ts, generators/{linkedin,cv,linkedin-audit}.ts}
├── scan/config.ts            # Zod ScanConfig
├── run-scan.ts               # orchestrator: collect → extractEvidence → runGeneration
├── run-generation.ts         # Stage 2: scan-anchored + standalone paths, getLatestEvidence
├── profile.ts, activity.ts, documents/, linkedin/
components/
├── ui/                       # primitives: button, card, dropzone, score-ring, top-nav...
└── <feature>/                # onboarding/, scan/, cv/, linkedin/, profile/, results/...
auth.ts                       # Auth.js config: identity-only scope + signIn token upsert
.claude/skills/               # project skills: arch-check, harness-check, spec-acceptance, new-generator
```

## Conventions

- **Naming:** ALL files = lowercase kebab-case (`run-scan.ts`, `copy-block.tsx`, `button.tsx`).
  Exported symbols (components, types, interfaces) = PascalCase. Functions/vars = camelCase.
- **Validation at the boundary:** every request body is parsed with its Zod schema in the route before
  use (`scanConfigSchema.parse(body)`). Never trust client input.
- **Error handling:** services throw. Routes try/catch and map to status codes. `runScan` catches
  everything and writes `status: "error"` + message to the `scans` row (never let it throw unhandled).
- **Security:** GitHub tokens and AI keys are server-only. Never send them to the client. No env var
  gets a `NEXT_PUBLIC_` prefix unless it's truly public. Anything importing `db` is server-only —
  never import it from a `"use client"` component.
- **Source of truth:** the DB. No client-side persistence (no localStorage). Progress is read from the
  `scans` row via polling.
- **Auditability:** every scan persists its config + raw collected data + evidence; every generation
  persists provider, model, prompt, and raw response. Do not skip these. (The persisted prompt is also
  how evidence-less runs are detected — keep the `GROUNDING EVIDENCE` marker stable.)
- **One component per file.** Keep components presentational; fetch data in Server Components / pages
  and pass via props. Don't fetch inside deep client components.

## Scan execution pattern (read carefully)

`POST /api/scans` checks repo scope (403 without it), creates the `scans` row (`status: pending`),
then **kicks off `runScan` WITHOUT awaiting** (fire-and-forget), returning `{ scanId }` immediately.
`runScan` updates `progress` (0→60 collection, 80 after evidence, 100 after AI) in the DB as it goes.
The client polls `GET /api/scans/[id]` every ~1.5s and redirects to `/results/[id]` on `status: "done"`.

> **RULE:** the scan must run on a long-lived process (local dev or the VPS). On serverless
> (Vercel), the function can freeze after responding and kill the fire-and-forget. Do not assume
> serverless for the scan. A job queue is the "correct" production fix but is **out of scope** now —
> do not add one unless asked.

## AI handler rules

- The provider resolution in `lib/ai/provider.ts` is **agnostic via env** (`AI_PROVIDER` / `AI_MODEL`).
  Never hardcode a provider in calling code. Adding a provider = a new `case` in `resolveModel`.
- Always use `generateObject` + a Zod output schema (structured output). Keep schemas **flat** —
  Gemini's structured output is less reliable with deeply nested schemas. Wrap calls in try/catch.
- Compliance guardrails live in `COMPLIANCE_RULES` (`lib/ai/shared.ts`): never expose client names,
  internal/secret project details, or credentials; focus on impact, not sensitive technical detail.
- Evidence in prompts goes through `groundingBlock()` only — never hand-roll the JSON interpolation.

## Extending (future features)

Portfolio and similar features **reuse the same spine** (evidence + AI handler). To add one:
1. New flat output Zod schema + a `generateX()` fn in `lib/ai/generators/` (copy the `cv.ts` pattern —
   including optional-evidence handling if the feature works standalone).
2. Save to `generations` with its `type` (add to the enum if needed).
3. New route + view. **Do not** touch collection or auth. No new infra.

Run `/new-generator` for the full checklist, and `/arch-check` + `/harness-check` on the diff.

## Do / Don't

- DO keep routes thin and logic in services. DO validate with Zod at boundaries. DO persist audit data.
- DO make evidence optional enrichment in standalone features (include-or-omit, nothing more).
- DON'T put business logic in components or routes. DON'T import `next/*` inside `lib/` services.
- DON'T produce evidence anywhere but the scan. DON'T gate CV/audit behind a scan or repo consent.
- DON'T request repo scope outside the scan flow. DON'T remove the `signIn` token-upsert callback.
- DON'T auto-edit LinkedIn, add multi-user/roles, add a queue, or download git diffs. All out of scope.
- DON'T expose secrets to the client. DON'T use localStorage.

## Key modules

| File | Role |
|---|---|
| `db/schema.ts` | `scans`, `generations` (userId + nullable scanId), `repositories`, `documents`, `linkedin_imports`, `profile_settings`, `audit_logs` |
| `lib/scan/config.ts` | Zod `ScanConfig` |
| `lib/github/collect.ts` | `collectGitHubActivity(token, targets, config, onProgress)` |
| `lib/github/scope.ts` | `hasRepoScope(userId)` — two-tier OAuth gate |
| `lib/ai/evidence.ts` | `evidenceSchema` + `extractEvidence` (Stage 1, scan-only) |
| `lib/ai/shared.ts` | `COMPLIANCE_RULES`, `groundingBlock`, `GROUNDING_MARKER`, prompt helpers |
| `lib/ai/generators/` | `generateLinkedIn(evidence, config)`, `analyzeCv(cvText, config, evidence?)`, `auditLinkedIn(profile, config, evidence?)` |
| `lib/run-scan.ts` | Scan orchestrator (collect → evidence → generation) |
| `lib/run-generation.ts` | `runGeneration` (scan-anchored), `runStandaloneGeneration`, `getLatestEvidence` |
| `lib/profile.ts` | `getOrCreateProfile` — auto-provision from GitHub (handle, bio→targetRole, company→industry) |

## Project skills (`.claude/skills/`)

Use these to check that new work stays on-architecture:

- **`/arch-check`** — audit the current diff against the layering rules above.
- **`/harness-check`** — verify the conditional-evidence and two-tier-OAuth invariants.
- **`/spec-acceptance`** — walk `ADJUSTMENTS-onboarding-harness.md` acceptance criteria against the code.
- **`/new-generator`** — checklist for adding a new AI feature on the existing spine.
