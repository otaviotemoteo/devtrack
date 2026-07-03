import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { generations } from "@/db/schema";
import type { ActivityType } from "@/components/activity/activity-row";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  label: string;
  timestamp: string;
  href: string;
}

/** User's generations (newest first), shaped for ActivityRow. */
export async function getActivity(
  userId: string,
  limit = 50
): Promise<ActivityItem[]> {
  const rows = await db
    .select({
      id: generations.id,
      type: generations.type,
      output: generations.output,
      createdAt: generations.createdAt,
      scanId: generations.scanId,
    })
    .from(generations)
    .where(eq(generations.userId, userId))
    .orderBy(desc(generations.createdAt))
    .limit(limit);

  return rows
    .filter(
      (r): r is typeof r & { type: ActivityType } =>
        r.type === "linkedin" || r.type === "cv" || r.type === "linkedin_audit"
    )
    .map((r) => {
      const output = (r.output ?? {}) as Record<string, unknown>;
      return {
        id: r.id,
        type: r.type,
        label: deriveLabel(r.type, output),
        timestamp: formatTimestamp(r.createdAt),
        href:
          r.type === "linkedin"
            ? `/results/${r.scanId}`
            : r.type === "cv"
              ? `/cv/${r.id}`
              : `/linkedin/${r.id}`,
      };
    });
}

function deriveLabel(type: ActivityType, output: Record<string, unknown>): string {
  if (type === "linkedin") return str(output.headline) || "LinkedIn content";
  const verdict = str(output.verdict);
  if (verdict) return verdict;
  const score = typeof output.score === "number" ? ` · score ${output.score}` : "";
  return (type === "cv" ? "CV analysis" : "LinkedIn audit") + score;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function formatTimestamp(d: Date): string {
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${date} · ${time}`;
}
