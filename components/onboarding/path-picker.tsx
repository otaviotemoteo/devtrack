"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PATHS = [
  {
    key: "linkedin",
    glyph: "in",
    title: "Build my LinkedIn",
    subtitle: "Turn your GitHub work into profile content.",
    badge: "most popular" as string | null,
    href: "/scan/new?type=linkedin",
  },
  {
    key: "cv",
    glyph: "✓",
    title: "Improve my CV",
    subtitle: "Score and sharpen your resume.",
    badge: null as string | null,
    href: "/cv",
  },
  {
    key: "github",
    glyph: "</>",
    title: "Connect GitHub & scan",
    subtitle: "Pull in your real commits and PRs.",
    badge: null as string | null,
    href: "/scan/new",
  },
] as const;

export function PathPicker() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function choose(firstChoice: string | null, href: string) {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firstChoice ? { firstChoice } : {}),
      });
      router.push(href);
    } catch {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-20 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Where do you want to start?
      </h1>
      <p className="mt-3 text-ink-soft">
        Pick a path — you can do the others anytime.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {PATHS.map((p, i) => (
          <button
            key={p.key}
            onClick={() => choose(p.key, p.href)}
            disabled={busy}
            className={`flex flex-col items-center gap-4 rounded-card border bg-bg p-8 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 disabled:opacity-60 ${
              i === 0 ? "border-green" : "border-border"
            }`}
          >
            <span className="grid h-16 w-16 place-items-center rounded-btn border border-green/40 bg-green-soft font-display text-xl font-bold text-green-dark">
              {p.glyph}
            </span>
            <span className="font-display text-xl font-bold text-ink">
              {p.title}
            </span>
            <span className="text-sm text-ink-soft">{p.subtitle}</span>
            {p.badge && (
              <span className="inline-flex items-center gap-2 rounded-chip border border-green/40 bg-green-soft px-3 py-1 font-mono text-xs lowercase text-green-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                {p.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => choose(null, "/")}
        disabled={busy}
        className="mt-10 text-sm font-semibold text-green-dark transition-colors hover:text-green disabled:opacity-60"
      >
        I&apos;ll explore on my own →
      </button>
    </main>
  );
}
