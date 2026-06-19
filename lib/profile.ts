import { eq } from "drizzle-orm";
import { Octokit } from "@octokit/rest";
import { db } from "@/db";
import { profileSettings } from "@/db/schema";
import { getGithubToken } from "@/lib/github/token";

export type ProfileSettings = typeof profileSettings.$inferSelect;

/**
 * Return the user's profile_settings row, creating it (onboarded=false) on
 * first access and lazily caching the GitHub @handle for the profile header.
 */
export async function getOrCreateProfile(
  userId: string
): Promise<ProfileSettings> {
  let profile = await readProfile(userId);

  if (!profile) {
    await db
      .insert(profileSettings)
      .values({ userId })
      .onConflictDoNothing({ target: profileSettings.userId });
    profile = await readProfile(userId);
  }

  if (profile && !profile.githubLogin) {
    try {
      const token = await getGithubToken(userId);
      const { data: me } = await new Octokit({ auth: token }).users.getAuthenticated();
      const [updated] = await db
        .update(profileSettings)
        .set({ githubLogin: me.login, updatedAt: new Date() })
        .where(eq(profileSettings.userId, userId))
        .returning();
      if (updated) profile = updated;
    } catch {
      // No token / GitHub error — leave the handle null, header falls back to name.
    }
  }

  // profile is guaranteed here (created above if it was missing).
  return profile as ProfileSettings;
}

async function readProfile(userId: string): Promise<ProfileSettings | undefined> {
  const [row] = await db
    .select()
    .from(profileSettings)
    .where(eq(profileSettings.userId, userId))
    .limit(1);
  return row;
}
