# CLAUDE.md — DevTrack

Personal, single-user app. Scans my own GitHub activity (commits + PRs) and uses AI to
generate LinkedIn-ready content. Everything runs on free tiers. This file is the project's
constitution: follow it.

> Account/credential setup (GitHub OAuth, Google AI Studio, Neon) lives in
> `Guia de Construção` — not here. Assume those exist via env vars.

## Core flow

`Landing → Login (GitHub OAuth) → Onboarding (build ScanConfig) → Scan (collect + progress)
→ AI (agnostic handler) → Results (copyable blocks)`

LinkedIn is **copy-paste, never auto-edit** — the official profile-edit API is gated behind
an enterprise partner program we can't access. Generate text + tell the user where to paste it.

## Stack (locked — do not swap without being asked)

- **Next.js (App Router)** — frontend + API routes. No separate backend.
- **Auth.js v5 (next-auth)** + `@auth/drizzle-adapter` — GitHub OAuth, DB sessions.
- **Drizzle ORM + Neon** (Postgres). Dev: `drizzle-kit push`.
- **Vercel AI SDK (`ai`)** + `@ai-sdk/google` (default). Fallbacks: groq, openrouter.
- **Octokit** (`@octokit/rest`) for GitHub. **Lenis** for landing scroll. **Tailwind** + Zod.

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
├── page.tsx                 # landing (Lenis)
├── login/page.tsx
├── onboarding/page.tsx      # form → ScanConfig → POST /api/scans
├── scan/[id]/page.tsx       # progress bar (polling)
├── results/[id]/page.tsx    # copyable blocks
└── api/
    ├── auth/[...nextauth]/route.ts
    └── scans/{route.ts, [id]/route.ts}
db/{schema.ts, auth-schema.ts, index.ts}
lib/
├── github/{collect.ts, token.ts}   # GitHub service
├── ai/index.ts                     # AI service (agnostic handler)
├── scan/config.ts                  # Zod ScanConfig
└── run-scan.ts                     # orchestrator: composes github + ai
components/
├── ui/                             # primitives: button.tsx, card.tsx, toggle.tsx...
└── <feature>/                      # feature components (e.g. copy-block.tsx, progress-bar.tsx)
auth.ts                             # Auth.js config (scopes live here)
```

## Conventions

- **Naming:** ALL files = lowercase kebab-case (`run-scan.ts`, `copy-block.tsx`, `button.tsx`).
  Exported symbols (components, types, interfaces) = PascalCase. Functions/vars = camelCase. DB columns = snake_case.
- **Validation at the boundary:** every request body is parsed with its Zod schema in the route before
  use (`scanConfigSchema.parse(body)`). Never trust client input.
- **Error handling:** services throw. Routes try/catch and map to status codes. `runScan` catches
  everything and writes `status: "error"` + message to the `scans` row (never let it throw unhandled).
- **Security:** GitHub tokens and AI keys are server-only. Never send them to the client. No env var
  gets a `NEXT_PUBLIC_` prefix unless it's truly public.
- **Source of truth:** the DB. No client-side persistence (no localStorage). Progress is read from the
  `scans` row via polling.
- **Auditability:** every scan persists its config + raw collected data; every generation persists
  provider, model, prompt, and raw response. Do not skip these.
- **One component per file.** Keep components presentational; fetch data in Server Components / pages
  and pass via props. Don't fetch inside deep client components.

## Scan execution pattern (read carefully)

`POST /api/scans` creates the `scans` row (`status: pending`), then **kicks off `runScan` WITHOUT
awaiting** (fire-and-forget), returning `{ scanId }` immediately. `runScan` updates `progress` (0→80
during collection, 100 after AI) in the DB as it goes. The client polls `GET /api/scans/[id]` every
~1.5s and redirects to `/results/[id]` on `status: "done"`.

> **RULE:** the scan must run on a long-lived process (local dev or the VPS). On serverless
> (Vercel), the function can freeze after responding and kill the fire-and-forget. Do not assume
> serverless for the scan. A job queue is the "correct" production fix but is **out of scope** now —
> do not add one unless asked.

## AI handler rules

- The handler in `lib/ai/index.ts` is **provider-agnostic via env** (`AI_PROVIDER` / `AI_MODEL`).
  Never hardcode a provider in calling code. Adding a provider = a new `case` in `resolveModel`.
- Always use `generateObject` + a Zod output schema (structured output). Keep schemas **flat** —
  Gemini's structured output is less reliable with deeply nested schemas. Wrap calls in try/catch.
- Compliance guardrails live in the system prompt: never expose client names, internal/secret
  project details, or credentials; focus on impact, not sensitive technical detail.

## Extending (future features)

Portfolio and CV analysis **reuse the same spine** (GitHub data + AI handler). To add one:
1. New output Zod schema + a `generateX()` fn in `lib/ai` (same pattern as `generateLinkedInContent`).
2. Save to `generations` with `type` = `portfolio` | `cv` (the column already exists).
3. New route + view. **Do not** touch collection or auth. No new infra.

## Do / Don't

- DO keep routes thin and logic in services. DO validate with Zod at boundaries. DO persist audit data.
- DON'T put business logic in components or routes. DON'T import `next/*` inside `lib/` services.
- DON'T auto-edit LinkedIn, add multi-user/roles, add a queue, or download git diffs. All out of scope.
- DON'T expose secrets to the client. DON'T use localStorage.

## Existing modules (already written — build around these)

| File | Role |
|---|---|
| `db/schema.ts` | App tables: `scans`, `generations`, `audit_logs` |
| `lib/scan/config.ts` | Zod `ScanConfig` (onboarding answers) |
| `lib/github/collect.ts` | `collectGitHubActivity(token, config, onProgress)` |
| `lib/ai/index.ts` | Agnostic AI handler + `linkedinOutputSchema` |

## Build order

1. Project + deps + env. 2. DB (auth-schema, client, `drizzle-kit push`). 3. Auth + login (test it).
4. `getGithubToken` helper. 5. Onboarding form. 6. `run-scan.ts` + scan routes. 7. Progress page (polling).
8. Results page (copy blocks). 9. Landing (Lenis + white/green branding).
