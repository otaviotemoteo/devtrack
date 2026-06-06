import { db } from "@/db";
import { accounts } from "@/db/auth-schema";
import { eq, and } from "drizzle-orm";

export async function getGithubToken(userId: string): Promise<string> {
  const [account] = await db
    .select({ access_token: accounts.access_token })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "github")))
    .limit(1);

  if (!account?.access_token) {
    throw new Error(`No GitHub token found for user ${userId}`);
  }

  return account.access_token;
}
