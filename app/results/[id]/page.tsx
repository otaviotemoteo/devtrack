import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { scans, generations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { AppHeader } from "@/components/ui/app-header";
import { CopyBlock, CopyButton } from "@/components/results/copy-block";
import { linkedinOutputSchema } from "@/lib/ai";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [scan] = await db
    .select()
    .from(scans)
    .where(and(eq(scans.id, id), eq(scans.userId, session.user.id)))
    .limit(1);

  if (!scan || scan.status !== "done") redirect(`/scan/${id}`);

  const [generation] = await db
    .select()
    .from(generations)
    .where(eq(generations.scanId, id))
    .limit(1);

  const parsed = linkedinOutputSchema.safeParse(generation?.output);

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader user={session.user} />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
              Done! Here&apos;s your content
            </h1>
            <p className="mt-2 text-ink-soft">
              Copy each block into the matching LinkedIn field.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="shrink-0 rounded-btn border border-border bg-bg px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-bg-soft"
          >
            Scan again
          </Link>
        </div>

        {!parsed.success ? (
          <div className="mt-10 rounded-card border border-border bg-bg-soft p-6">
            <p className="text-ink-soft">
              We couldn&apos;t read the generated content. Raw output:
            </p>
            <pre className="mt-3 overflow-auto rounded-input bg-bg p-4 text-sm text-ink">
              {JSON.stringify(generation?.output, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {/* Headline */}
            <CopyBlock label="profile headline" copyText={parsed.data.headline}>
              <p className="text-ink">{parsed.data.headline}</p>
            </CopyBlock>

            {/* About */}
            <CopyBlock label="about section" copyText={parsed.data.about}>
              <p className="whitespace-pre-line leading-relaxed text-ink">
                {parsed.data.about}
              </p>
            </CopyBlock>

            {/* Skills */}
            <CopyBlock label="skills" copyText={parsed.data.skills.join(", ")}>
              <div className="flex flex-wrap gap-2">
                {parsed.data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-chip border border-border bg-bg px-4 py-1.5 text-sm text-ink"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CopyBlock>

            {/* Experience */}
            {parsed.data.experience.length > 0 && (
              <div className="rounded-card border border-border bg-bg p-7 shadow-soft">
                <span className="inline-flex items-center gap-2 rounded-chip bg-green-soft px-3 py-1 font-mono text-xs lowercase tracking-wide text-green-dark">
                  <span className="h-1.5 w-1.5 rounded-full bg-green" />
                  experience
                </span>
                <div className="mt-5 space-y-4">
                  {parsed.data.experience.map((exp, i) => (
                    <div
                      key={i}
                      className="rounded-card border border-border bg-bg-soft p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-semibold text-ink">
                          {exp.company} · {exp.role} · {exp.period}
                        </p>
                        <CopyButton
                          copyText={`${exp.company} · ${exp.role} · ${exp.period}\n\n${exp.description}`}
                        />
                      </div>
                      <p className="mt-3 leading-relaxed text-ink-soft">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
