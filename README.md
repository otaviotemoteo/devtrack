# DevTrack

Most of what a developer actually builds ends up buried in GitHub, where nobody
looks. DevTrack reads that history, turns it into a structured record of what you
did, and uses that record as the ground truth for the LinkedIn text you never got
around to writing, an honest read on the CV you already have, and an audit of the
profile currently representing you.

**In one sentence:** it goes through your commits and pull requests, works out
what you actually built, and writes the parts of your professional profile that
should have been describing it.

---

## What it's for

This is not a writing problem, it is a memory problem. Asked what you did last
year, you name the two things you happen to remember, and both are recent. The
rest is in a repository you have not opened since March. People with the most
contributions have the most invisible work, which is the wrong way around.

The usual fixes both fail at the same point. Reconstructing it by hand once a
year produces a summary of what you remember rather than of what happened, and
memory is precisely what failed. Asking a chatbot to write your LinkedIn produces
confident text about a career it has never seen. Neither one reads the record
that already exists.

The trade is that it stops one step short of done, and would rather say less than
say something it cannot support. It will not edit your LinkedIn, because the
official profile-edit API sits behind an enterprise partner program a personal
project cannot enter, so it writes the text and tells you where to paste it. And
if it has never scanned your GitHub, a CV analysis still runs, but the prompt is
explicitly forbidden from referencing or inventing development work: you get a
thinner result and an offer to scan, rather than a richer one built out of
nothing.

## What you actually do with it

**Once, at the start.** Sign in with GitHub. That first sign-in asks for your
identity and nothing else, because at that point there is nothing to read
repositories for. Then you pick which of the three things you came for.

**When you want the record built.** Starting a scan is the moment the app asks
for repository access, separately and explicitly. You choose which repositories
count and can write a line of context on any of them, because a repository name
rarely says what the project was. The scan reads your commits and pull requests
and distils them into evidence: the themes running through the work, the projects
with the repository each is proven by, and the skills with a reason attached to
each. Out the other side comes LinkedIn content in copyable blocks.

**When you have something to check.** Upload a CV and get a score, a verdict,
what it does well, and every problem paired with a concrete fix, plus a rewritten
summary and before-and-after versions of your weakest bullets. Upload your
LinkedIn export and the same treatment lands on your live profile, section by
section. Neither flow touches your repositories, under any setting.

## The ideas behind it

- **One place produces evidence, everything else only reads it.** The scan is the
  only writer. The CV and audit flows read the latest evidence if it exists and
  are forbidden from inventing it if it does not, which is what keeps three
  features from each having a slightly different idea of your career.
- **Missing information degrades the output, never blocks it.** No screen refuses
  to work because a field is empty. Not knowing your target role or your GitHub
  history makes the result thinner and says so, instead of putting a form in
  front of the thing you came to do.
- **Access is asked for where it is used, not at the door.** Signing in gets
  identity only. Repository access is a separate consent requested when a scan
  starts and never before. Two consent screens is a worse first impression and a
  better deal.

## Who can use it

It was built as a personal tool and works that way: you sign in with your own
GitHub account, everything produced belongs to it, and there are no roles, no
sharing and no team view. What it is not is single-tenant by accident. Every
table is keyed by user, so more than one person can use an instance without
seeing each other's data.

## Where the data goes

Into one Postgres database, and to whichever model provider is configured. The
GitHub token and the model key are server-side only and never reach the browser.
Uploaded CVs are stored as extracted text rather than as files, so the original
document does not sit on a disk afterwards. LinkedIn data comes from the official
export you download yourself; the optional scraping path is disabled unless
explicitly turned on, because it costs money and carries account risk.

Nothing is thrown away. Every scan keeps the raw data it collected alongside the
evidence it distilled, and every generation keeps the provider, the model, the
exact prompt and the raw response. Generated text about your own career should be
checkable against what produced it.

---

## For developers

| Document | What's in it |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Layering, the two-tier OAuth flow, the evidence harness, and the rules that hold them together |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Every table and field, and why each one is stored |
| [`docs/SETUP.md`](docs/SETUP.md) | Requirements, environment variables, the OAuth app, where it can run, troubleshooting |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | The visual language and the screen-by-screen brief |

```bash
pnpm install
cp .env.example .env.local   # DATABASE_URL, AUTH_GITHUB_ID/SECRET, AUTH_SECRET, model key
pnpm db:push
pnpm dev
```

The scan needs a long-lived process: it starts work without awaiting it and
reports progress through the database, which a serverless function can freeze
away. Local development or a VPS, not a serverless deploy.

Next.js App Router with no separate backend, Auth.js with the Drizzle adapter for
GitHub OAuth, Drizzle and Neon Postgres, the Vercel AI SDK over Google or Groq,
Octokit for GitHub, Zod at every boundary, Tailwind for the interface.
