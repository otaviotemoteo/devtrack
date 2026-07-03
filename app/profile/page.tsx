import { redirect } from "next/navigation";
import { count, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { repositories, documents, linkedinImports } from "@/db/schema";
import { ProfileHub } from "@/components/profile/profile-hub";
import { getOrCreateProfile } from "@/lib/profile";
import { getActivity } from "@/lib/activity";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const profile = await getOrCreateProfile(userId);
  const [repoCount] = await db
    .select({ n: count() })
    .from(repositories)
    .where(eq(repositories.userId, userId));
  const [latestDoc] = await db
    .select({ filename: documents.filename })
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt))
    .limit(1);
  const [latestImport] = await db
    .select({ id: linkedinImports.id })
    .from(linkedinImports)
    .where(eq(linkedinImports.userId, userId))
    .orderBy(desc(linkedinImports.createdAt))
    .limit(1);
  const activities = await getActivity(userId);

  return (
    <ProfileHub
      user={{ name: session.user.name, image: session.user.image }}
      githubLogin={profile.githubLogin}
      repoCount={repoCount?.n ?? 0}
      cvFilename={latestDoc?.filename ?? null}
      hasImport={!!latestImport}
      context={{
        situation: profile.situation,
        currentRole: profile.currentRole ?? "",
        currentCompany: profile.currentCompany ?? "",
        currentSince: profile.currentSince ?? "",
        projects: profile.projects ?? "",
        targetRole: profile.targetRole ?? "",
        industry: profile.industry ?? "",
        extraInstructions: profile.extraInstructions ?? "",
      }}
      experiences={profile.experiences}
      activities={activities}
    />
  );
}
