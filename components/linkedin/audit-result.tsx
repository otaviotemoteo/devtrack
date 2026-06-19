import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ScoreRing } from "@/components/ui/score-ring";
import { CopyBlock, CopyButton } from "@/components/results/copy-block";
import { RegenerateButton } from "@/components/results/regenerate-button";
import type { AuditOutput } from "@/lib/ai/generators/linkedin-audit";

export function AuditResult({
  audit,
  scanId,
}: {
  audit: AuditOutput;
  scanId: string;
}) {
  return (
    <>
      <Card className="flex items-center justify-between gap-4 p-7">
        <ScoreRing score={audit.score} verdict={audit.verdict} />
        <RegenerateButton
          scanId={scanId}
          type="linkedin_audit"
          resultBase="/linkedin"
          label="Re-import"
        />
      </Card>

      <section>
        <SectionHeading title="Gaps" subtitle="Section · what's missing · suggestion." />
        <Card className="mt-4 p-7">
          <div className="space-y-6">
            {audit.gaps.map((g, i) => (
              <div
                key={i}
                className="border-b border-border pb-6 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green" />
                  <span className="font-semibold text-ink">{g.section}</span>
                </div>
                <p className="mt-2 text-ink-soft">{g.gap}</p>
                <p className="mt-2 text-ink">
                  <span className="font-mono text-xs text-green-dark">fix → </span>
                  {g.suggestion}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionHeading title="Improved blocks" />
        <div className="mt-4 space-y-4">
          <CopyBlock label="headline" copyText={audit.improvedHeadline}>
            <p className="leading-relaxed text-ink">{audit.improvedHeadline}</p>
          </CopyBlock>
          <CopyBlock label="about" copyText={audit.improvedAbout}>
            <p className="whitespace-pre-wrap leading-relaxed text-ink">
              {audit.improvedAbout}
            </p>
          </CopyBlock>
        </div>
      </section>

      {audit.suggestedSkills.length > 0 && (
        <section>
          <SectionHeading title="Suggested skills" />
          <div className="mt-4 flex flex-wrap gap-2">
            {audit.suggestedSkills.map((s, i) => (
              <Chip key={i} variant="green">
                {s}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {audit.experienceRewrites.length > 0 && (
        <section>
          <SectionHeading title="Experience rewrites" />
          <div className="mt-4 space-y-4">
            {audit.experienceRewrites.map((exp, i) => (
              <Card key={i} className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{exp.company}</p>
                    <p className="text-sm text-ink-soft">{exp.role}</p>
                  </div>
                  <CopyButton copyText={exp.improvedBullets.join("\n")} />
                </div>
                <ul className="mt-4 space-y-2">
                  {exp.improvedBullets.map((b, j) => (
                    <li key={j} className="flex gap-2 text-ink">
                      <span className="text-green">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Card>
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
