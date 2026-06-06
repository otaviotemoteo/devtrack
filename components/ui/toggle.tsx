"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer select-none items-center gap-3"
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-chip transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
          checked ? "bg-green" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-soft transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-ink">{label}</span>
    </label>
  );
}
