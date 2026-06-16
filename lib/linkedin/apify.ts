import type { NormalizedProfile } from "./import-export";

/**
 * OPTIONAL, OPT-IN path — paid and ToS/account-risky. Disabled unless
 * ENABLE_APIFY=true and APIFY_TOKEN are set. Fetches a profile by URL via an
 * Apify actor and normalizes to the same shape as the official export, so the
 * audit generator is source-agnostic. Not the default; intended for later use
 * on other people's profiles.
 */
export async function fetchLinkedInProfileViaApify(
  profileUrl: string
): Promise<NormalizedProfile> {
  if (process.env.ENABLE_APIFY !== "true" || !process.env.APIFY_TOKEN) {
    throw new Error(
      "Apify LinkedIn import is disabled. Set ENABLE_APIFY=true and APIFY_TOKEN to enable it."
    );
  }

  const actor = process.env.APIFY_LINKEDIN_ACTOR ?? "dev_fusion~linkedin-profile-scraper";
  const res = await fetch(
    `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileUrls: [profileUrl] }),
    }
  );

  if (!res.ok) {
    throw new Error(`Apify request failed: ${res.status} ${res.statusText}`);
  }

  const items = (await res.json()) as Record<string, unknown>[];
  return normalizeApifyItem(items[0] ?? {});
}

// Best-effort mapping — actor field names vary; fall back gracefully.
function normalizeApifyItem(item: Record<string, unknown>): NormalizedProfile {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const experiences = Array.isArray(item.experiences)
    ? (item.experiences as Record<string, unknown>[])
    : [];
  const skills = Array.isArray(item.skills)
    ? (item.skills as unknown[]).map((s) =>
        typeof s === "string" ? s : str((s as Record<string, unknown>)?.title)
      )
    : [];

  return {
    headline: str(item.headline) || str(item.occupation),
    about: str(item.summary) || str(item.about),
    experience: experiences.map((e) => ({
      company: str(e.companyName) || str(e.company),
      role: str(e.title) || str(e.position),
      period: [str(e.starts_at) || str(e.startDate), str(e.ends_at) || str(e.endDate) || "now"]
        .filter(Boolean)
        .join(" – "),
      description: str(e.description),
    })),
    skills: skills.filter(Boolean),
  };
}
