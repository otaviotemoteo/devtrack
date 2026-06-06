"use client";

import { useState } from "react";

export function CopyButton({ copyText }: { copyText: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <button
      onClick={copy}
      aria-live="polite"
      className={`shrink-0 rounded-btn px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
        copied
          ? "bg-green text-white"
          : "border border-border bg-bg text-ink hover:bg-bg-soft"
      }`}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

interface CopyBlockProps {
  label: string;
  /** Text copied to clipboard. */
  copyText: string;
  children: React.ReactNode;
}

export function CopyBlock({ label, copyText, children }: CopyBlockProps) {
  return (
    <div className="rounded-card border border-border bg-bg p-7 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-chip bg-green-soft px-3 py-1 font-mono text-xs lowercase tracking-wide text-green-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          {label}
        </span>
        <CopyButton copyText={copyText} />
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
