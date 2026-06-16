import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGithubToken } from "@/lib/github/token";
import { syncRepositories } from "@/lib/github/repos";

// Sync all repos from GitHub (preserving selection/context), then return them.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getGithubToken(session.user.id);
    const repos = await syncRepositories(session.user.id, token);
    return NextResponse.json({ repositories: repos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
