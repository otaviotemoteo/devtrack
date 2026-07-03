---
name: new-generator
description: Checklist and guide for adding a new AI feature (e.g. portfolio, cover letter) on DevTrack's existing spine — evidence + agnostic AI handler. Use when the user asks to add a new generation type.
---

# New generator on the existing spine

Add a new AI feature reusing the evidence + AI-handler spine. **Do not** touch collection,
auth, or infra. Reference implementation: the CV feature (`lib/ai/generators/cv.ts`,
`app/api/cv/route.ts`, `app/cv/`).

## Decide first

- **Scan-anchored or standalone?**
  - Inherently GitHub-derived (like LinkedIn generation) → evidence REQUIRED, first param,
    dispatched from `runGeneration`.
  - Works on a user-provided artifact (like CV/audit) → evidence OPTIONAL last param
    (`generateX(artifact, config, evidence?)`), dispatched from `runStandaloneGeneration`
    (extend its type union) — grounding via `groundingBlock(evidence)` only.

## Checklist

1. **Schema** — new FLAT Zod output schema in `lib/ai/generators/<feature>.ts` (Gemini is
   unreliable with deep nesting). Export the inferred type.
2. **Generator** — `generateX()` in the same file, following the `cv.ts` pattern exactly:
   `aiProvider()` + `resolveModel()`, system prompt with `languageLabel`, `COMPLIANCE_RULES`,
   `profileContextLines(config)`, conditional `groundingBlock(evidence)` (if optional-evidence),
   `generateObject` in try/catch, return `GeneratorResult<T>` (output, provider, model, prompt,
   rawResponse). Never hardcode a provider.
3. **DB** — add the type to the `generations.type` enum in `db/schema.ts`, then `pnpm db:push`
   (needs DATABASE_URL exported; see project memory for the rtk/env quirks).
4. **Dispatch** — add the `case` in `runGeneration` and/or extend `runStandaloneGeneration`.
5. **Route** — thin: auth → Zod parse → service → response. Standalone entries build a minimal
   config with `scanConfigSchema.parse({ target: { kind: "global" } })`.
6. **View** — result page under `app/<feature>/[id]/page.tsx` (ownership check via
   `generations.userId`, handle `scanId: string | null`), presentational component in
   `components/<feature>/`. Show `EnrichmentUpsell` when the persisted prompt lacks
   `GROUNDING_MARKER` (standalone features only). Hide `RegenerateButton` when `scanId` is null.
7. **Activity** — add the type mapping in `lib/activity.ts` (label + href).
8. **Docs** — update CLAUDE.md's key-modules table and folder map.

## Verify

- `node_modules/.bin/next build` passes.
- Run `/arch-check` and `/harness-check` on the diff.
- Exercise both evidence-present and evidence-absent paths (if standalone) and confirm the
  prompt persisted in `generations.prompt` contains / lacks the grounding marker accordingly.
