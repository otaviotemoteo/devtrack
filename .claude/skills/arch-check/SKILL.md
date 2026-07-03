---
name: arch-check
description: Audit the current diff (or given files) against DevTrack's layering constitution in CLAUDE.md. Use after writing or reviewing any code change to verify it respects the architecture.
---

# Architecture check

Audit the changed code against the project constitution (CLAUDE.md). Scope: the current
working diff (`git diff` + `git diff --staged` + untracked files), or the files the user names.

## Checks to run

For every changed file, verify:

1. **Layering**
   - `lib/` services MUST NOT import from `next/*`, `next-auth` (server `auth()` included), or
     anything HTTP/request-shaped. They receive dependencies (tokens, configs, ids) as arguments.
   - API routes (`app/api/`) are THIN: exactly auth check → Zod parse → service call → HTTP
     mapping. Any loop, branching business rule, or data shaping beyond response mapping is a
     violation — it belongs in a `lib/` service.
   - No business logic in components. Components are presentational; pages fetch and pass props.

2. **Boundaries**
   - Every request body/query parsed with a Zod schema before use. No `body.foo` on unparsed input.
   - Server-only modules (anything importing `db`, tokens, AI keys) never imported from a
     `"use client"` file.
   - No `NEXT_PUBLIC_` env vars unless truly public. No secrets ever sent to the client.

3. **Conventions**
   - File names: lowercase kebab-case. Exported symbols PascalCase; functions/vars camelCase.
   - One component per file. `"use client"` only where there's real interactivity.
   - No localStorage / client-side persistence — the DB is the source of truth.
   - Services throw; routes try/catch and map to status codes.

4. **Scope discipline**
   - No job queues, multi-user/roles, LinkedIn auto-editing, or git-diff downloading.
   - Stack not swapped (Next.js, Auth.js v5, Drizzle+Neon, Vercel AI SDK, Octokit).

## Output

A short report:
- **Violations** — file:line, which rule, and the concrete fix (most severe first).
- **Warnings** — smells that aren't hard violations (e.g. a route growing toward logic).
- **Pass** — one line if clean.

Do not fix anything unless the user asks — report only.
