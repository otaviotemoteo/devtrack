import { Octokit } from "@octokit/rest";
import type { ScanConfig } from "@/lib/scan/config";

export interface GitHubActivity {
  commits: unknown[];
  pullRequests: unknown[];
}

export async function collectGitHubActivity(
  token: string,
  config: ScanConfig,
  onProgress: (progress: number) => Promise<void>
): Promise<GitHubActivity> {
  const _octokit = new Octokit({ auth: token });

  // TODO: implement commit + PR collection
  // Progress: 10 after auth check, 40 after commits, 80 after PRs
  void config;

  await onProgress(10);

  return {
    commits: [],
    pullRequests: [],
  };
}
