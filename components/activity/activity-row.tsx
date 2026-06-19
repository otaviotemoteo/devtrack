import Link from "next/link";

export type ActivityType = "linkedin" | "cv" | "linkedin_audit";

const TAG_LABEL: Record<ActivityType, string> = {
  linkedin: "linkedin",
  cv: "cv",
  linkedin_audit: "li audit",
};

interface ActivityRowProps {
  type: ActivityType;
  label: string;
  /** Preformatted timestamp string. */
  timestamp: string;
  href: string;
}

export function ActivityRow({ type, label, timestamp, href }: ActivityRowProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="inline-flex shrink-0 items-center gap-2 rounded-chip border border-green/40 bg-green-soft px-3 py-1 font-mono text-xs lowercase tracking-wide text-green-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-green" />
        {TAG_LABEL[type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-ink">{label}</p>
        <p className="font-mono text-xs text-ink-soft">{timestamp}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-btn border border-border bg-bg px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-bg-soft"
      >
        View
      </Link>
    </div>
  );
}
