"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

// Elevated scopes for the incremental consent. Kept inline: lib/github/scope.ts
// is server-only (imports the db client) and can't be bundled client-side.
const REPO_SCOPES = "read:user,user:email,repo,read:org";

/**
 * Incremental-consent step shown when a scan is requested without the `repo`
 * scope. Re-runs the GitHub authorize flow asking for the elevated scopes,
 * then returns to the scan screen.
 */
export function ConnectRepos({ generationType }: { generationType: string }) {
  const [busy, setBusy] = useState(false);

  function connect() {
    if (busy) return;
    setBusy(true);
    signIn(
      "github",
      { callbackUrl: `/scan/new?type=${generationType}` },
      { scope: REPO_SCOPES }
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <div className="rounded-card border border-border bg-bg p-12 text-center shadow-soft">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-btn border border-green/40 bg-green-soft font-display text-xl font-bold text-green-dark">
          {"</>"}
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">
          Connect your repositories
        </h1>
        <p className="mt-3 text-ink-soft">
          Scanning reads your commits and pull requests, which needs repository
          access. GitHub will ask you to approve it — one extra click, only for
          scans.
        </p>
        <button
          onClick={connect}
          disabled={busy}
          className="mt-8 inline-flex w-full items-center justify-center rounded-btn bg-green px-6 py-4 font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark disabled:opacity-60"
        >
          {busy ? "Redirecting…" : "Connect repositories"}
        </button>
        <p className="mt-4 text-xs text-ink-soft">
          Read-only access. Your CV and LinkedIn audit never require this.
        </p>
      </div>
    </main>
  );
}
