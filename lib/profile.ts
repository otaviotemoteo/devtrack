import { eq } from "drizzle-orm";
import { Octokit } from "@octokit/rest";
import { db } from "@/db";
import { profileSettings } from "@/db/schema";
import { users } from "@/db/auth-schema";
import { getGithubToken } from "@/lib/github/token";
import type { Experience, ExperienceDraft } from "@/lib/experiences";

export type ProfileSettings = typeof profileSettings.$inferSelect;

export interface ProfileUpdate {
  name?: string;
  githubLogin?: string | null;
  situation?: "employed" | "searching" | "student";
  currentRole?: string | null;
  currentCompany?: string | null;
  currentSince?: string | null;
  projects?: string | null;
  targetRole?: string | null;
  industry?: string | null;
  extraInstructions?: string | null;
  experiences?: Experience[];
  contextPromptDismissed?: boolean;
}

/**
 * Persist a profile edit. `name` lives on the auth `users` row (it's what the
 * session/nav display); everything else goes to `profile_settings`.
 */
export async function updateProfile(
  userId: string,
  data: ProfileUpdate
): Promise<ProfileSettings> {
  const { name, ...settings } = data;

  if (name !== undefined) {
    await db.update(users).set({ name }).where(eq(users.id, userId));
  }

  await getOrCreateProfile(userId);
  const [updated] = await db
    .update(profileSettings)
    .set({ ...settings, updatedAt: new Date() })
    .where(eq(profileSettings.userId, userId))
    .returning();

  // Connect the dots: saving "I'm working as X at Y" auto-creates that
  // experience card (already confirmed — it's the user's own words), so the
  // Experience section never appears empty right after onboarding.
  if (
    (data.situation !== undefined ||
      data.currentRole !== undefined ||
      data.currentSince !== undefined) &&
    updated.situation === "employed" &&
    updated.currentRole &&
    !hasSimilarExperience(updated.experiences, updated.currentRole, updated.currentCompany ?? "")
  ) {
    const experiences: Experience[] = [
      {
        id: crypto.randomUUID(),
        company: updated.currentCompany ?? "",
        role: updated.currentRole,
        period: updated.currentSince ? `${updated.currentSince} – now` : "now",
        description: "",
        source: "manual",
        confirmed: true,
      },
      ...updated.experiences,
    ];
    const [reupdated] = await db
      .update(profileSettings)
      .set({ experiences, updatedAt: new Date() })
      .where(eq(profileSettings.userId, userId))
      .returning();
    return reupdated;
  }

  return updated;
}

/**
 * Pre-fill the profile's experiences from an import (LinkedIn export positions
 * or CV-extracted positions). Appends only entries not already present
 * (matched by role+company) — never overwrites user-managed data — and marks
 * them unconfirmed so the profile UI can ask "we pre-filled this, is it
 * correct?".
 */
export async function seedExperiences(
  userId: string,
  drafts: ExperienceDraft[],
  source: "linkedin" | "cv"
): Promise<void> {
  const items = drafts
    .filter((d) => d.company.trim() || d.role.trim())
    .slice(0, 20);
  if (items.length === 0) return;

  const profile = await getOrCreateProfile(userId);
  const additions: Experience[] = items
    .filter((d) => !hasSimilarExperience(profile.experiences, d.role, d.company))
    .map((d) => ({
      id: crypto.randomUUID(),
      company: d.company.slice(0, 200),
      role: d.role.slice(0, 200),
      period: d.period.slice(0, 100),
      description: d.description.slice(0, 1000),
      source,
      confirmed: false,
    }));
  if (additions.length === 0) return;

  await db
    .update(profileSettings)
    .set({
      experiences: [...profile.experiences, ...additions].slice(0, 20),
      updatedAt: new Date(),
    })
    .where(eq(profileSettings.userId, userId));
}

function hasSimilarExperience(
  existing: Experience[],
  role: string,
  company: string
): boolean {
  const key = (r: string, c: string) =>
    `${r.trim().toLowerCase()}|${c.trim().toLowerCase()}`;
  const target = key(role, company);
  return existing.some((e) => key(e.role, e.company) === target);
}

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
        .set({
          githubLogin: me.login,
          // Suggested from the GitHub bio/company — editable, never overwrites
          // a value the user already set, never blocks anything.
          targetRole: profile.targetRole ?? me.bio ?? undefined,
          industry: profile.industry ?? me.company?.replace(/^@/, "") ?? undefined,
          updatedAt: new Date(),
        })
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
