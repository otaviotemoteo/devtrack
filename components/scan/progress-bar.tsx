"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ScanStatus {
  status: "pending" | "running" | "done" | "error";
  progress: number;
  errorMessage?: string | null;
}

// Status line rotates as the scan moves through stages.
function stageLabel(progress: number): string {
  if (progress < 15) return "Connecting to GitHub…";
  if (progress < 45) return "Collecting your commits…";
  if (progress < 80) return "Analyzing commits and pull requests…";
  if (progress < 100) return "Writing your LinkedIn content…";
  return "Done!";
}

export function ProgressBar({ scanId }: { scanId: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Could not read scan status.");
        const data: ScanStatus = await res.json();
        if (cancelled) return;

        setProgress(data.progress);

        if (data.status === "done") {
          router.push(`/results/${scanId}`);
          return;
        }
        if (data.status === "error") {
          setError(data.errorMessage ?? "The scan failed.");
          return;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unexpected error.");
        }
        return;
      }
      if (!cancelled) timer = setTimeout(poll, 1500);
    };

    let timer = setTimeout(poll, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scanId, router]);

  if (error) {
    return (
      <div className="w-full max-w-md rounded-card border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">Scan failed</p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="mt-4 rounded-btn border border-border bg-bg px-4 py-2 text-sm font-semibold text-ink hover:bg-bg-soft"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center">
      <span className="mb-8 grid h-12 w-12 place-items-center rounded-full bg-green-soft">
        <span className="h-4 w-4 animate-pulse-soft rounded-full bg-green" />
      </span>

      <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-ink">
        Scanning your GitHub…
      </h1>

      <div className="h-3 w-full overflow-hidden rounded-chip border border-border bg-bg">
        <div
          className="h-full rounded-chip bg-green transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex w-full items-center justify-between">
        <span className="text-sm text-ink-soft">{stageLabel(progress)}</span>
        <span className="text-sm font-semibold text-green-dark">{progress}%</span>
      </div>
    </div>
  );
}
