# Setup

---

## Requirements

- Node 20 or newer, and pnpm
- A Postgres database. Neon's free tier is what this was built against
- A GitHub OAuth App
- An API key for one model provider, Google AI Studio by default

---

## Running it

```bash
pnpm install
cp .env.example .env.local     # fill in the values below
pnpm db:push                   # apply the schema
pnpm dev
```

`pnpm db:studio` opens Drizzle Studio against the same database if you want to
look at rows directly.

---

## Environment

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `AUTH_GITHUB_ID` | yes | GitHub OAuth App client id |
| `AUTH_GITHUB_SECRET` | yes | GitHub OAuth App client secret |
| `AUTH_SECRET` | yes | Session signing secret for Auth.js. `npx auth secret` generates one |
| `AI_PROVIDER` | no | `google` (default) or `groq`. `gemini` is accepted as an alias for `google` |
| `AI_MODEL` | no | Model name for that provider. Defaults to `gemini-3.6-flash` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | when using google | Read by the provider SDK |
| `GROQ_API_KEY` | when using groq | Read by the provider SDK |
| `ENABLE_APIFY` | no | `true` turns on the optional LinkedIn scraping path. Off by default |
| `APIFY_TOKEN` | when Apify is on | |
| `APIFY_LINKEDIN_ACTOR` | no | Defaults to `dev_fusion~linkedin-profile-scraper` |

None of these gets a `NEXT_PUBLIC_` prefix. Every one of them is server-only,
and anything that imports the database is server-only along with it.

---

## The GitHub OAuth App

Create one at **Settings → Developer settings → OAuth Apps**.

- Homepage URL: `http://localhost:3000` in development
- Authorization callback URL:
  `http://localhost:3000/api/auth/callback/github`

Do not configure scopes on the app itself. Scopes are requested per
authorization: sign-in asks for `read:user,user:email`, and `repo,read:org` is
requested separately, at the moment a scan starts. That split is described in
[`ARCHITECTURE.md`](ARCHITECTURE.md) and is the reason you will see GitHub's
consent screen twice.

---

## Where it can run

**Not on serverless, at least not the scan.** `POST /api/scans` starts the work
without awaiting it and returns immediately so the client can poll for progress.
On a serverless platform the function may be frozen once it has responded, which
kills the work in flight and leaves a row stuck at `running`.

Local development and a long-lived VPS both work. Moving the scan to a job queue
would remove the constraint and is deliberately out of scope for now, so the
constraint is documented rather than designed around.

---

## Troubleshooting

**A scan 403s when you start it.** The account has signed in but has not granted
repository access. `/scan/new` should be showing the connect screen. If it is
not, the stored scope is stale: sign out and back in.

**A scan starts and the token turns out to be wrong.** This is the failure mode
the manual token upsert in `auth.ts` exists to prevent. The Drizzle adapter only
persists tokens on the first account link, so if that callback is removed or
short-circuited, the elevated token from the second consent is dropped and the
scan runs with the identity-only one. Do not remove the `signIn` callback.

**A scan sits at `running` forever.** Either the process that started it went
away, which is the serverless case above, or `runScan` threw somewhere its catch
does not cover. `scans.errorMessage` is the first place to look.

**Structured output fails intermittently.** The output schemas are deliberately
flat, because Gemini's structured output gets less reliable as nesting deepens.
A new generator that fails to parse is usually asking for a nested shape. Flatten
it before blaming the model.
