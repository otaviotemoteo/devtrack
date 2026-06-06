"use client";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Visual size. */
  size?: "sm" | "md";
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: SegmentedProps<T>) {
  const pad = size === "sm" ? "px-4 py-1.5 text-sm" : "px-5 py-2.5";

  return (
    <div
      className={`inline-flex rounded-btn border border-ink/80 p-0.5 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`rounded-[7px] font-semibold transition-colors duration-200 ${pad} ${
              active
                ? "bg-green text-white"
                : "bg-transparent text-ink hover:bg-bg-soft"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
