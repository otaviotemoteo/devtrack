import { CopyButton } from "@/components/results/copy-block";

interface BeforeAfterProps {
  before: string;
  after: string;
}

/** Two-column BEFORE (muted) vs AFTER (green tint), with Copy on the AFTER side. */
export function BeforeAfter({ before, after }: BeforeAfterProps) {
  return (
    <div className="rounded-card border border-border bg-bg p-7 shadow-soft">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Before
          </p>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink-soft">
            {before || "—"}
          </p>
        </div>
        <div className="rounded-card bg-green-soft/50 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-xs uppercase tracking-wide text-green-dark">
              After ✦
            </p>
            <CopyButton copyText={after} />
          </div>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink">
            {after}
          </p>
        </div>
      </div>
    </div>
  );
}
