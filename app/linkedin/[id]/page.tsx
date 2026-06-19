import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { generations, scans } from "@/db/schema";
import { TopNav } from "@/components/ui/top-nav";
import { Card } from "@/components/ui/card";
import { AuditResult } from "@/components/linkedin/audit-result";
import { auditOutputSchema } from "@/lib/ai/generators/linkedin-audit";

export default async function LinkedinResultPage({
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
      userId: scans.userId,
    })
    .from(generations)
    .innerJoin(scans, eq(generations.scanId, scans.id))
    .where(and(eq(generations.id, id), eq(generations.type, "linkedin_audit")))
    .limit(1);

  if (!row || row.userId !== session.user.id) notFound();

  const parsed = auditOutputSchema.safeParse(row.output);

  return (
    <div className="min-h-screen bg-bg">
      <TopNav
        variant="app"
        user={{ name: session.user.name, image: session.user.image }}
      />
      <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
        {parsed.success ? (
          <AuditResult audit={parsed.data} scanId={row.scanId} />
        ) : (
          <Card className="p-7">
            <p className="text-ink-soft">This audit could not be read.</p>
          </Card>
        )}
      </main>
    </div>
  );
}
