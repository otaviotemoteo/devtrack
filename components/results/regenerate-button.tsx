"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegenerateButtonProps {
  scanId: string;
  type: "cv" | "linkedin_audit";
  resultBase: "/cv" | "/linkedin";
  label: string;
}

/** Re-run a generator from the scan's stored evidence (no re-scan), then
 * navigate to the freshly created generation. */
export function RegenerateButton({
  scanId,
  type,
  resultBase,
  label,
}: RegenerateButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push(`${resultBase}/${data.generationId}`);
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={run}
      disabled={busy}
      className="shrink-0 rounded-btn border border-border bg-bg px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-bg-soft disabled:opacity-60"
    >
      {busy ? "Working…" : label}
    </button>
  );
}
