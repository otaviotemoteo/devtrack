import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ScoreRing } from "@/components/ui/score-ring";
import { BeforeAfter } from "@/components/results/before-after";
import { RegenerateButton } from "@/components/results/regenerate-button";
import type { CvOutput } from "@/lib/ai/generators/cv";

export function CvResult({
  cv,
  scanId,
}: {
  cv: CvOutput;
  scanId: string | null;
}) {
  return (
    <>
      <Card className="flex items-center justify-between gap-4 p-7">
        <ScoreRing score={cv.score} verdict={cv.verdict} />
        {/* Regeneration is scan-anchored; standalone results re-run via re-upload. */}
        {scanId && (
          <RegenerateButton
            scanId={scanId}
            type="cv"
            resultBase="/cv"
            label="Re-analyze"
          />
        )}
      </Card>

      {cv.strengths.length > 0 && (
        <section>
          <SectionHeading title="Strengths" />
          <div className="mt-4 flex flex-wrap gap-2">
            {cv.strengths.map((s, i) => (
              <Chip key={i} variant="green">
                {s}
              </Chip>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading
          title="Summary rewrite"
          subtitle="Original vs. improved, side by side."
        />
        <div className="mt-4">
          <BeforeAfter before={cv.originalSummary} after={cv.improvedSummary} />
        </div>
      </section>

      {cv.improvedBullets.length > 0 && (
        <section>
          <SectionHeading title="Bullet improvements" />
          <div className="mt-4 space-y-4">
            {cv.improvedBullets.map((b, i) => (
              <BeforeAfter key={i} before={b.original} after={b.improved} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading title="Issues" subtitle="Area · problem · suggested fix." />
        <Card className="mt-4 p-7">
          <div className="space-y-6">
            {cv.issues.map((it, i) => (
              <div
                key={i}
                className="border-b border-border pb-6 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green" />
                  <span className="font-semibold text-ink">{it.area}</span>
                </div>
                <p className="mt-2 text-ink-soft">{it.problem}</p>
                <p className="mt-2 text-ink">
                  <span className="font-mono text-xs text-green-dark">fix → </span>
                  {it.fix}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {cv.missingKeywords.length > 0 && (
        <section>
          <SectionHeading
            title="Missing keywords"
            subtitle="Proven by your GitHub work, absent from the CV."
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {cv.missingKeywords.map((k, i) => (
              <Chip key={i} variant="green">
                {k}
              </Chip>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
    </div>
  );
}
