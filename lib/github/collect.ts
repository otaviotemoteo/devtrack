import { Octokit } from "@octokit/rest";
import type { ScanConfig } from "@/lib/scan/config";

export interface CollectedCommit {
  repo: string;
  sha: string;
  message: string;
  date: string;
}

export interface CollectedPullRequest {
  repo: string;
  title: string;
  body: string;
  state: string;
  merged: boolean;
  date: string;
}

export interface GitHubActivity {
  commits: CollectedCommit[];
  pullRequests: CollectedPullRequest[];
}

/** The minimal repo shape the collector needs (derived from `repositories`). */
export interface CollectTarget {
  fullName: string;
  owner: string;
  name: string;
}

// "YYYY-MM" -> ISO start-of-month (inclusive lower bound).
function monthToSince(m?: string): string | undefined {
  return m ? new Date(`${m}-01T00:00:00.000Z`).toISOString() : undefined;
}

// "YYYY-MM" -> ISO start of the FOLLOWING month (exclusive upper bound).
function monthToUntil(m?: string): string | undefined {
  if (!m) return undefined;
  const [y, mo] = m.split("-").map(Number);
  return new Date(Date.UTC(y, mo, 1)).toISOString();
}

// Build the GitHub search date qualifier (created:from..to) from YYYY-MM bounds.
function searchDateQualifier(from?: string, to?: string): string {
  const start = from ? `${from}-01` : "*";
  let end = "*";
  if (to) {
    const [y, mo] = to.split("-").map(Number);
    const last = new Date(Date.UTC(y, mo, 0)); // day 0 = last day of month `mo`
    end = last.toISOString().slice(0, 10);
  }
  return start === "*" && end === "*" ? "" : ` created:${start}..${end}`;
}

/**
 * Collect the authenticated user's commits + authored PRs across the given
 * repos, within the optional date range. Reports progress 0→100 (the caller
 * rescales it into its own band). Per-repo failures are skipped, not fatal.
 */
export async function collectGitHubActivity(
  token: string,
  repos: CollectTarget[],
  config: ScanConfig,
  onProgress: (progress: number) => Promise<void>
): Promise<GitHubActivity> {
  const octokit = new Octokit({ auth: token });

  const { data: me } = await octokit.users.getAuthenticated();
  const login = me.login;
  await onProgress(10);

  const since = monthToSince(config.dateFrom);
  const until = monthToUntil(config.dateTo);
  const dateQualifier = searchDateQualifier(config.dateFrom, config.dateTo);

  const commits: CollectedCommit[] = [];
  const pullRequests: CollectedPullRequest[] = [];
  const total = Math.max(repos.length, 1);

  // --- Commits (10 → 40) ---
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    try {
      const repoCommits = await octokit.paginate(octokit.repos.listCommits, {
        owner: repo.owner,
        repo: repo.name,
        author: login,
        since,
        until,
        per_page: 100,
      });
      for (const c of repoCommits) {
        commits.push({
          repo: repo.fullName,
          sha: c.sha,
          message: c.commit.message,
          date: c.commit.author?.date ?? c.commit.committer?.date ?? "",
        });
      }
    } catch {
      // Repo may be inaccessible / empty — skip it.
    }
    await onProgress(10 + Math.round(((i + 1) / total) * 30));
  }

  // --- Authored PRs (40 → 100) ---
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    try {
      const q = `is:pr author:${login} repo:${repo.fullName}${dateQualifier}`;
      const found = await octokit.paginate(
        octokit.search.issuesAndPullRequests,
        { q, per_page: 100 }
      );
      for (const pr of found) {
        pullRequests.push({
          repo: repo.fullName,
          title: pr.title,
          body: pr.body ?? "",
          state: pr.state,
          merged: pr.pull_request?.merged_at != null,
          date: pr.created_at,
        });
      }
    } catch {
      // Search rate-limit / access issue — skip this repo's PRs.
    }
    await onProgress(40 + Math.round(((i + 1) / total) * 60));
  }

  return { commits, pullRequests };
}
