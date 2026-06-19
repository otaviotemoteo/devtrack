"use client";

import { useRef, useState } from "react";

const inputClass =
  "w-full rounded-input border border-border bg-bg px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20";

interface ProfileContextFormProps {
  initial: {
    targetRole: string | null;
    industry: string | null;
    extraInstructions: string | null;
  };
}

type SaveState = "idle" | "saving" | "saved";

export function ProfileContextForm({ initial }: ProfileContextFormProps) {
  const [targetRole, setTargetRole] = useState(initial.targetRole ?? "");
  const [industry, setIndustry] = useState(initial.industry ?? "");
  const [extraInstructions, setExtraInstructions] = useState(
    initial.extraInstructions ?? ""
  );
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSave(next: {
    targetRole: string;
    industry: string;
    extraInstructions: string;
  }) {
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("idle");
      }
    }, 700);
  }

  return (
    <div className="mt-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-ink-soft">Target role</span>
          <input
            className={inputClass}
            placeholder="e.g. Senior Backend Engineer"
            value={targetRole}
            onChange={(e) => {
              setTargetRole(e.target.value);
              scheduleSave({ targetRole: e.target.value, industry, extraInstructions });
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-ink-soft">Industry</span>
          <input
            className={inputClass}
            placeholder="e.g. Fintech"
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              scheduleSave({ targetRole, industry: e.target.value, extraInstructions });
            }}
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm text-ink-soft">Extra instructions</span>
        <textarea
          className={`${inputClass} min-h-28 resize-y`}
          placeholder="Anything that should shape every generation — tone, focus, things to avoid…"
          value={extraInstructions}
          onChange={(e) => {
            setExtraInstructions(e.target.value);
            scheduleSave({ targetRole, industry, extraInstructions: e.target.value });
          }}
        />
      </label>

      <p className="mt-2 h-4 text-sm text-ink-soft">
        {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : ""}
      </p>
    </div>
  );
}
