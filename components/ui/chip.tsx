interface ChipProps {
  children: React.ReactNode;
  variant?: "plain" | "green";
}

/** Small pill used for skills / keywords. */
export function Chip({ children, variant = "plain" }: ChipProps) {
  const cls =
    variant === "green"
      ? "border-green/50 bg-green-soft/40 text-green-dark"
      : "border-border bg-bg text-ink";
  return (
    <span className={`rounded-chip border px-4 py-1.5 text-sm ${cls}`}>
      {children}
    </span>
  );
}
