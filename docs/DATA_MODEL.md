# Data model

Every table, every field, and why it is stored. Written so that a row read years
from now still means something.

The authentication tables (`users`, `accounts`, `sessions`,
`verificationTokens`) live in `db/auth-schema.ts` and belong to Auth.js. Only the
application's own tables are described here. All of them carry `userId` with
`onDelete: "cascade"`, so deleting an account removes everything it produced.

---

## `scans`

One row per GitHub scan. The scan is the only place evidence is ever produced,
which makes this table the origin of everything the generators know.

| Field | Type | What it holds |
|---|---|---|
| `id` | text, PK | UUID generated on insert |
| `userId` | text | Owner |
| `config` | jsonb | The `ScanConfig` exactly as submitted: which repos, which switches |
| `status` | text | `pending`, `running`, `done` or `error` |
| `progress` | integer | 0 to 100, written by `runScan` as it works. This is what the client polls |
| `rawData` | jsonb | The unprocessed activity collected from GitHub, before distillation |
| `evidence` | jsonb | The stage-one output: themes, projects, skills, timeline |
| `errorMessage` | text | Set when `status` is `error`. `runScan` catches everything and writes here, because a fire-and-forget throw has nowhere to go |
| `createdAt` | timestamp | |

`rawData` and `evidence` are both kept on purpose. `rawData` is the proof, and
`evidence` is the distillation. Keeping only the second one would mean the app
could show you a claim about your work and be unable to show what it was drawn
from.

---

## `generations`

One row per model call that produced user-facing output.

| Field | Type | What it holds |
|---|---|---|
| `id` | text, PK | |
| `userId` | text | Owner |
| `scanId` | text, nullable | The scan this came from, or NULL for a standalone CV or audit |
| `type` | text | `linkedin`, `portfolio`, `cv` or `linkedin_audit` |
| `provider` | text | Which vendor answered |
| `model` | text | Which model, by name |
| `prompt` | text | The full prompt as sent |
| `rawResponse` | text | The raw answer, before parsing |
| `output` | jsonb | The parsed, schema-validated result the UI renders |
| `createdAt` | timestamp | |

Two things here are load-bearing rather than nice to have.

**`scanId` being NULL is meaningful.** It is how a result page knows it is
looking at a standalone generation. Placeholder scan rows are never created just
to keep the column populated, because that would make the scan table lie about
how many scans happened.

**The stored `prompt` is also a flag.** Whether a generation had evidence behind
it is determined by looking for the `GROUNDING EVIDENCE` marker in this text.
That means the marker string is part of the data contract, not just prompt
formatting, and changing it retroactively changes how old rows are interpreted.

---

## `repositories`

A cache of the account's GitHub repositories, plus the parts the user owns.

| Field | Type | What it holds |
|---|---|---|
| `id` | text, PK | |
| `userId` | text | Owner |
| `githubId` | integer | GitHub's own id. Unique together with `userId` |
| `fullName` | text | `owner/name` |
| `description`, `language` | text | As reported by GitHub |
| `isPrivate`, `isOrg` | boolean | Used to honour the scan config's switches |
| `owner` | text | |
| `selected` | boolean | Whether the user picked it for the next scan |
| `userContext` | text | A free-text note the user wrote about this repo |
| `lastSyncedAt` | timestamp | |

`selected` and `userContext` are user-owned and survive a re-sync. Everything
else is overwritten from GitHub. That split is the whole reason this table
exists instead of the app querying GitHub every time: a note you wrote about
what a repository actually was should not be destroyed by a refresh.

---

## `documents`

Uploaded files, stored as extracted plain text.

| Field | Type | What it holds |
|---|---|---|
| `id` | text, PK | |
| `userId` | text | Owner |
| `kind` | text | `cv` or `other` |
| `filename` | text | The original name, for display |
| `extractedText` | text | The text pulled out of the PDF or DOCX |
| `createdAt` | timestamp | |

The original binary is not kept. The analyzer works on text, so the text is what
is stored, and the uploaded file does not sit on a disk somewhere afterwards.

---

## `linkedin_imports`

| Field | Type | What it holds |
|---|---|---|
| `id` | text, PK | |
| `userId` | text | Owner |
| `source` | text | `export` for the official LinkedIn data export, `apify` for the optional scraping path |
| `data` | jsonb | Normalised to `{ headline, about, experience[], skills[] }` |
| `createdAt` | timestamp | |

Both sources are normalised to the same shape before storage, which is what lets
the audit generator be written without knowing where a profile came from. The
`apify` path is opt-in, disabled unless explicitly enabled, and not the default.

---

## `profile_settings`

Standing context about the person, one row per user. Everything here is fed to
every generator as default context, and everything here is optional.

| Field | Type | What it holds |
|---|---|---|
| `id` | text, PK | |
| `userId` | text, unique | One row per account |
| `targetRole` | text | The role being aimed at |
| `industry` | text | |
| `extraInstructions` | text | Free text the user wants applied to every generation |
| `situation` | text | `employed`, `searching` or `student` |
| `currentRole`, `currentCompany` | text | Asked only of employed users |
| `currentSince` | text | Free text on purpose, for example "Mar 2022" |
| `projects` | text | Side or study projects, described by the user |
| `experiences` | jsonb | The user's work history, seeded once from a LinkedIn export or a CV analysis with `confirmed: false`, and user-owned afterwards |
| `onboarded` | boolean | Gates the first-run picker |
| `firstChoice` | text | Which of the three features was picked first: `linkedin`, `cv` or `github` |
| `contextPromptDismissed` | boolean | Remembers "Skip for now" on the completion card |
| `githubLogin` | text | Cached handle, for the profile header |
| `createdAt`, `updatedAt` | timestamp | |

`experiences` is the one field seeded by a machine and then handed over. An
import or a CV analysis fills it in with entries marked unconfirmed, and from
the moment the user touches it the app stops writing to it. That boundary is
what keeps a re-import from quietly overwriting a correction someone made by
hand.

`situation` changes which questions are asked, not which are required. Someone
employed gets sharpening questions about their current role; someone searching
or studying gets targeting questions instead. Every generator runs with all of
these empty, so none of them is ever a gate.

`onboarded` and `contextPromptDismissed` exist so that a person who declined
something is not asked again. A prompt that reappears after being dismissed is a
prompt that teaches people to ignore the interface.

---

## `audit_logs`

| Field | Type | What it holds |
|---|---|---|
| `id` | text, PK | |
| `userId` | text | Owner |
| `action` | text | What happened |
| `metadata` | jsonb | Whatever that action needed to record |
| `createdAt` | timestamp | |

---

## A note on the column names

The columns are camelCase (`userId`, `createdAt`, `fullName`) rather than the
snake_case that is conventional in Postgres. That came from the Auth.js Drizzle
adapter, whose expected column names are camelCase, and the application's own
tables were made to match rather than mixing two conventions in one database.
Renaming them now would require a migration against real data for no functional
gain, so the convention stays and is written down here instead.
