import { Octokit } from "@octokit/rest";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { repositories } from "@/db/schema";

export type Repository = typeof repositories.$inferSelect;

/**
 * Sync ALL of the user's GitHub repos into the `repositories` cache so the
 * pre-scan screen can list them. Upserts on (userId, githubId): repo metadata
 * is refreshed, but the user-owned `selected` / `userContext` columns are
 * preserved across re-syncs. Framework-agnostic — token is passed in.
 */
export async function syncRepositories(
  userId: string,
  token: string
): Promise<Repository[]> {
  const octokit = new Octokit({ auth: token });

  const repos = await octokit.paginate(
    octokit.repos.listForAuthenticatedUser,
    {
      per_page: 100,
      affiliation: "owner,organization_member,collaborator",
      sort: "pushed",
    }
  );

  if (repos.length > 0) {
    const rows = repos.map((r) => ({
      userId,
      githubId: r.id,
      fullName: r.full_name,
      description: r.description ?? null,
      language: r.language ?? null,
      isPrivate: r.private,
      isOrg: r.owner?.type === "Organization",
      owner: r.owner?.login ?? r.full_name.split("/")[0] ?? "",
      lastSyncedAt: new Date(),
    }));

    await db
      .insert(repositories)
      .values(rows)
      .onConflictDoUpdate({
        target: [repositories.userId, repositories.githubId],
        // Refresh metadata only — never clobber selected / userContext.
        set: {
          fullName: sql`excluded."fullName"`,
          description: sql`excluded."description"`,
          language: sql`excluded."language"`,
          isPrivate: sql`excluded."isPrivate"`,
          isOrg: sql`excluded."isOrg"`,
          owner: sql`excluded."owner"`,
          lastSyncedAt: sql`excluded."lastSyncedAt"`,
        },
      });
  }

  return db
    .select()
    .from(repositories)
    .where(eq(repositories.userId, userId))
    .orderBy(repositories.fullName);
}
