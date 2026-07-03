"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/ui/top-nav";
import { Dropzone } from "@/components/ui/dropzone";

const inputClass =
  "w-full rounded-input border border-border bg-bg px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20";

interface LinkedinImportScreenProps {
  user: { name?: string | null; image?: string | null };
  hasEvidence: boolean;
}

export function LinkedinImportScreen({
  user,
  hasEvidence,
}: LinkedinImportScreenProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  async function submit(init: RequestInit) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/linkedin/import", init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      router.push(`/linkedin/${data.generationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setBusy(false);
    }
  }

  function importExport(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    submit({ method: "POST", body: fd });
  }

  function importApify() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a profile URL.");
      return;
    }
    const full = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    submit({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: full }),
    });
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopNav variant="app" user={user} working={busy} />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-center font-display text-4xl font-bold tracking-tight text-ink">
          Audit your LinkedIn
        </h1>
        <p className="mt-3 text-center text-ink-soft">
          Import your profile to get a scored audit.
        </p>

        {hasEvidence && (
          <p className="mt-4 text-center text-sm text-green-dark">
            ✓ The audit will be grounded in your GitHub evidence.
          </p>
        )}

        <div className="mt-10 space-y-6">
            {/* Recommended — official export */}
            <div className="rounded-card border-2 border-green bg-bg p-7 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">
                    Upload your LinkedIn data export
                  </h2>
                  <a
                    href="https://www.linkedin.com/mypreferences/d/download-my-data"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-green-dark transition-colors hover:text-green"
                  >
                    How to get it →
                  </a>
                </div>
                <span className="shrink-0 rounded-chip border border-green/40 bg-green-soft px-3 py-1 font-mono text-xs text-green-dark">
                  ● recommended
                </span>
              </div>
              <div className="mt-6">
                <Dropzone
                  accept=".zip"
                  maxSizeMB={25}
                  title="Drop your export .zip"
                  hint="Settings → Get a copy of your data"
                  onFile={importExport}
                />
              </div>
            </div>

            {/* Optional — Apify URL */}
            <div className="rounded-card border border-border bg-bg p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-lg font-bold text-ink">
                  Use a profile URL
                </h2>
                <span className="shrink-0 rounded-chip border border-border px-3 py-1 font-mono text-xs text-ink-soft">
                  optional · advanced
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <input
                  className={inputClass}
                  placeholder="linkedin.com/in/you"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button
                  onClick={importApify}
                  disabled={busy}
                  className="shrink-0 rounded-btn border border-ink/80 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-bg-soft disabled:opacity-60"
                >
                  Fetch
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                Paid · pay-per-result and subject to LinkedIn&apos;s ToS. Disabled
                unless the server has it enabled.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
      </main>
    </div>
  );
}
