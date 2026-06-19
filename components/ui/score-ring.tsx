interface ScoreRingProps {
  score: number;
  verdict: string;
}

/** Circular score ring (0–100) with a one-line verdict beside it. */
export function ScoreRing({ score, verdict }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (clamped / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="12"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--color-green)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-ink">{clamped}</span>
          <span className="font-mono text-xs text-ink-soft">/100</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-ink-soft">Overall score</p>
        <p className="mt-1 font-display text-xl font-bold text-ink">{verdict}</p>
      </div>
    </div>
  );
}
