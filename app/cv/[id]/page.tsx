import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { TopNav } from "@/components/ui/top-nav";
import { Card } from "@/components/ui/card";
import { CvResult } from "@/components/cv/cv-result";
import { EnrichmentUpsell } from "@/components/scan/enrichment-upsell";
import { cvOutputSchema } from "@/lib/ai/generators/cv";
import { GROUNDING_MARKER } from "@/lib/ai/shared";

export default async function CvResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const [row] = await db
    .select({
      output: generations.output,
      scanId: generations.scanId,
      userId: generations.userId,
      prompt: generations.prompt,
    })
    .from(generations)
    .where(and(eq(generations.id, id), eq(generations.type, "cv")))
    .limit(1);

  if (!row || row.userId !== session.user.id) notFound();

  const parsed = cvOutputSchema.safeParse(row.output);
  const usedEvidence = row.prompt.includes(GROUNDING_MARKER);

  return (
    <div className="min-h-screen bg-bg">
      <TopNav
        variant="app"
        user={{ name: session.user.name, image: session.user.image }}
      />
      <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
        {!usedEvidence && <EnrichmentUpsell what="CV analysis" />}
        {parsed.success ? (
          <CvResult cv={parsed.data} scanId={row.scanId} />
        ) : (
          <Card className="p-7">
            <p className="text-ink-soft">This analysis could not be read.</p>
          </Card>
        )}
      </main>
    </div>
  );
}
