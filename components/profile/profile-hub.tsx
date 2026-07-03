import Link from "next/link";
import Image from "next/image";
import { TopNav } from "@/components/ui/top-nav";
import { Card } from "@/components/ui/card";
import { ActivityRow } from "@/components/activity/activity-row";
import { ProfileContextForm } from "@/components/profile/profile-context-form";
import { CompletionCard } from "@/components/profile/completion-card";
import type { ActivityItem } from "@/lib/activity";

interface ProfileHubProps {
  user: { name?: string | null; image?: string | null };
  githubLogin: string | null;
  repoCount: number;
  cvFilename: string | null;
  hasImport: boolean;
  context: {
    targetRole: string | null;
    industry: string | null;
    extraInstructions: string | null;
  };
  contextPromptDismissed: boolean;
  activities: ActivityItem[];
}

export function ProfileHub({
  user,
  githubLogin,
  repoCount,
  cvFilename,
  hasImport,
  context,
  contextPromptDismissed,
  activities,
}: ProfileHubProps) {
  return (
    <div className="min-h-screen bg-bg">
      <TopNav variant="app" user={user} />
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-border bg-bg-soft">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "You"}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
                {user.name ?? "Your profile"}
              </h1>
              {githubLogin && (
                <p className="font-mono text-sm text-ink-soft">@{githubLogin}</p>
              )}
            </div>
          </div>
          <Link
            href="/scan/new"
            className="inline-flex items-center gap-2 rounded-btn bg-green px-5 py-2.5 font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark"
          >
            + New scan
          </Link>
        </div>

        <CompletionCard
          targetRole={context.targetRole}
          industry={context.industry}
          dismissed={contextPromptDismissed}
        />

        {/* Your sources */}
        <p className="eyebrow mt-12">Your sources</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <SourceCard
            title="GitHub"
            ok
            status="connected ✓"
            detail={`${repoCount} repositories synced`}
            foot={
              <Link
                href="/scan/new"
                className="text-sm font-semibold text-green-dark transition-colors hover:text-green"
              >
                Manage repos →
              </Link>
            }
          />
          <SourceCard
            title="Resume / CV"
            ok={!!cvFilename}
            status={cvFilename ? "uploaded ✓" : "not yet"}
            detail={cvFilename ?? "No CV uploaded yet."}
            foot={
              <Link
                href="/cv"
                className="inline-flex w-full items-center justify-center rounded-btn bg-green px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-green-dark"
              >
                {cvFilename ? "Re-upload CV" : "Upload CV"}
              </Link>
            }
          />
          <SourceCard
            title="LinkedIn"
            ok={hasImport}
            status={hasImport ? "imported ✓" : "not yet"}
            detail={hasImport ? "Profile imported." : "No profile imported yet."}
            foot={
              <Link
                href="/linkedin"
                className="inline-flex w-full items-center justify-center rounded-btn border border-border bg-bg px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-bg-soft"
              >
                {hasImport ? "Re-import" : "Import profile"}
              </Link>
            }
          />
        </div>

        {/* Profile context */}
        <Card className="mt-8 p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Profile context
          </h2>
          <p className="mt-1 text-ink-soft">
            Shapes every piece of content we generate for you.
          </p>
          <ProfileContextForm initial={context} />
        </Card>

        {/* History */}
        <Card className="mt-8 px-6 py-2">
          <div className="px-1 py-5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              History
            </h2>
            <p className="mt-1 text-ink-soft">
              Everything you&apos;ve generated, newest first.
            </p>
          </div>
          {activities.length === 0 ? (
            <p className="px-1 pb-6 text-ink-soft">Nothing yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((a) => (
                <ActivityRow
                  key={a.id}
                  type={a.type}
                  label={a.label}
                  timestamp={a.timestamp}
                  href={a.href}
                />
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

function SourceCard({
  title,
  ok,
  status,
  detail,
  foot,
}: {
  title: string;
  ok: boolean;
  status: string;
  detail: string;
  foot: React.ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">{title}</h3>
        <span
          className={`rounded-chip border px-3 py-1 font-mono text-xs ${
            ok
              ? "border-green/40 bg-green-soft text-green-dark"
              : "border-border text-ink-soft"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm text-ink-soft">{detail}</p>
      <div className="mt-5">{foot}</div>
    </Card>
  );
}
