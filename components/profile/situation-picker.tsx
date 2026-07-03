"use client";

import { Briefcase, Target, Sprout, type LucideIcon } from "lucide-react";

export type Situation = "employed" | "searching" | "student";

const OPTIONS: { key: Situation; icon: LucideIcon; label: string; hint: string }[] = [
  {
    key: "employed",
    icon: Briefcase,
    label: "I'm working",
    hint: "Sharpen how you present the work you already do — impact, scope, and seniority.",
  },
  {
    key: "searching",
    icon: Target,
    label: "Looking for a job",
    hint: "Angle everything toward the role you want recruiters to see you in.",
  },
  {
    key: "student",
    icon: Sprout,
    label: "Student / first job",
    hint: "Lean on projects and what you're learning to build your first profile.",
  },
];

/** "Where are you right now?" — click-to-choose cards, no typing. */
export function SituationPicker({
  value,
  onChange,
}: {
  value: Situation | null;
  onChange: (value: Situation) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OPTIONS.map((o) => {
        const selected = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`flex flex-col items-start gap-1.5 rounded-card border bg-bg p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
              selected
                ? "border-green bg-green-soft/40 shadow-soft"
                : "border-border hover:border-green/40"
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-ink">
              <o.icon className="h-4 w-4 shrink-0 text-green-dark" aria-hidden="true" />
              {o.label}
            </span>
            <span className="text-xs leading-relaxed text-ink-soft">{o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
