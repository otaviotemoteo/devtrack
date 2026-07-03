"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Soft CTA shown on evidence-less CV/audit results: the scan is where richer
 * results come from (it builds the evidence). Dismissible, never blocking.
 */
export function EnrichmentUpsell({ what }: { what: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-dashed border-green/40 bg-green-soft/40 px-5 py-4">
      <p className="text-sm text-ink-soft">
        This {what} used general best practices only. Run a GitHub scan for
        results grounded in your real work.
      </p>
      <div className="flex shrink-0 items-center gap-4">
        <Link
          href="/scan/new"
          className="text-sm font-semibold text-green-dark transition-colors hover:text-green"
        >
          Run a scan →
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-sm text-ink-soft transition-colors hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
