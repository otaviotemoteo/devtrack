"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/ui/top-nav";
import { VideoBackground } from "@/components/ui/video-background";

interface ProcessingScreenProps {
  title: string;
  /** Shown in order every ~2.5s, holding on the last one (no real progress signal). */
  stages: string[];
  videoSrc: string;
}

/**
 * Full-screen "working" view for synchronous analysis requests (CV, LinkedIn
 * audit). Mirrors the scan progress screen's look — the scan keeps its own
 * component because it has real progress to show.
 */
export function ProcessingScreen({
  title,
  stages,
  videoSrc,
}: ProcessingScreenProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStage((s) => Math.min(s + 1, stages.length - 1)),
      2500
    );
    return () => clearInterval(id);
  }, [stages.length]);

  return (
    <div className="relative flex min-h-screen flex-col bg-bg">
      <VideoBackground src={videoSrc} overlayClassName="bg-bg/50" />
      <TopNav variant="focused" />
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-xl flex-col items-center rounded-card border border-border bg-bg/85 p-10 text-center shadow-soft backdrop-blur-md">
          <span className="mb-8 grid h-12 w-12 place-items-center rounded-full bg-green-soft">
            <span className="h-4 w-4 animate-pulse-soft rounded-full bg-green" />
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            {title}
          </h1>
          <p aria-live="polite" className="mt-4 text-sm text-ink-soft">
            {stages[stage]}
          </p>
        </div>
      </main>
    </div>
  );
}
