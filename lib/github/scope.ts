import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/auth-schema";

/**
 * Whether the user's stored GitHub grant includes the `repo` scope.
 * Sign-in only grants identity scopes; scanning requires this check first.
 */
export async function hasRepoScope(userId: string): Promise<boolean> {
  const [account] = await db
    .select({ scope: accounts.scope })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "github")))
    .limit(1);

  const scopes = (account?.scope ?? "").split(",").map((s) => s.trim());
  return scopes.includes("repo");
}
