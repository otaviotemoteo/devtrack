"use client";

import { useState } from "react";

const PRESETS = ["Fintech", "SaaS", "E-commerce", "Health", "Gaming", "Consulting"];

const inputClass =
  "w-full rounded-input border border-border bg-bg px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20";

/** Industry as click-to-choose chips, with an "Other…" free-text escape hatch. */
export function IndustryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const isPreset = PRESETS.includes(value);
  const [showOther, setShowOther] = useState(!!value && !isPreset);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const selected = value === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                setShowOther(false);
                onChange(selected ? "" : p);
              }}
              className={`rounded-chip border px-3.5 py-1.5 text-sm transition-colors ${
                selected
                  ? "border-green/40 bg-green-soft font-semibold text-green-dark"
                  : "border-border text-ink-soft hover:border-green/40 hover:text-ink"
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setShowOther(true);
            if (isPreset) onChange("");
          }}
          className={`rounded-chip border px-3.5 py-1.5 text-sm transition-colors ${
            showOther
              ? "border-green/40 bg-green-soft font-semibold text-green-dark"
              : "border-border text-ink-soft hover:border-green/40 hover:text-ink"
          }`}
        >
          Other…
        </button>
      </div>
      {showOther && (
        <input
          autoFocus
          className={`${inputClass} mt-3`}
          placeholder="e.g. Logistics"
          value={isPreset ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
