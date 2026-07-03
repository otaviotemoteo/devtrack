"use client";

import { useState } from "react";

interface CompletionCardProps {
  targetRole: string | null;
  industry: string | null;
  dismissed: boolean;
}

/**
 * Friendly "finish setting up your profile" nudge — shown only while a tuning
 * field (targetRole/industry) is empty. "Skip for now" persists and never
 * re-nags; everything works with these fields empty.
 */
export function CompletionCard({
  targetRole,
  industry,
  dismissed: initialDismissed,
}: CompletionCardProps) {
  const [dismissed, setDismissed] = useState(initialDismissed);
  if (dismissed || (targetRole && industry)) return null;

  async function skip() {
    setDismissed(true);
    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contextPromptDismissed: true }),
    }).catch(() => {});
  }

  return (
    <div className="mt-8 flex items-center justify-between gap-4 rounded-card border border-dashed border-green/40 bg-green-soft/40 px-5 py-4">
      <p className="text-sm text-ink-soft">
        <span className="font-semibold text-ink">Finish setting up your profile</span>{" "}
        — add your target role and industry below to sharpen everything we
        generate for you.
      </p>
      <button
        onClick={skip}
        className="shrink-0 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        Skip for now
      </button>
    </div>
  );
}
