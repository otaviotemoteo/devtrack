"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/ui/top-nav";
import { Dropzone } from "@/components/ui/dropzone";
import { EvidenceGate } from "@/components/scan/evidence-gate";

interface CvScreenProps {
  user: { name?: string | null; image?: string | null };
  hasEvidence: boolean;
}

export function CvScreen({ user, hasEvidence }: CvScreenProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cv", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      router.push(`/cv/${data.generationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopNav variant="app" user={user} working={busy} />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-center font-display text-4xl font-bold tracking-tight text-ink">
          Analyze your CV
        </h1>
        <p className="mt-3 text-center text-ink-soft">
          We&apos;ll score it and suggest improvements.
        </p>

        {!hasEvidence ? (
          <EvidenceGate what="CV analysis" />
        ) : (
          <div className="mt-10">
            <Dropzone
              accept=".pdf,.docx"
              maxSizeMB={10}
              title="Drop your CV here"
              hint="PDF or DOCX · up to 10 MB"
              onFile={setFile}
            />
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button
              onClick={analyze}
              disabled={!file || busy}
              className="mt-6 inline-flex w-full items-center justify-center rounded-btn bg-green px-6 py-4 font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark disabled:opacity-60"
            >
              {busy ? "Analyzing…" : "Analyze"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
