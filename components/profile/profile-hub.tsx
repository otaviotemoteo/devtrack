import Link from "next/link";
import Image from "next/image";
import { TopNav } from "@/components/ui/top-nav";
import { Card } from "@/components/ui/card";
import { ActivityRow } from "@/components/activity/activity-row";
import { ProfileContextForm, type ProfileContext } from "@/components/profile/profile-context-form";
import { CompletionCard } from "@/components/profile/completion-card";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { EditableIdentity } from "@/components/profile/editable-identity";
import { ExperienceCards } from "@/components/profile/experience-cards";
import type { ActivityItem } from "@/lib/activity";
import type { Experience } from "@/lib/experiences";

interface ProfileHubProps {
  user: { name?: string | null; image?: string | null };
  githubLogin: string | null;
  repoCount: number;
  cvFilename: string | null;
  hasImport: boolean;
  context: ProfileContext;
  experiences: Experience[];
  activities: ActivityItem[];
}

export function ProfileHub({
  user,
  githubLogin,
  repoCount,
  cvFilename,
  hasImport,
  context,
  experiences,
  activities,
}: ProfileHubProps) {
  // Same completion rule as CompletionCard: progressive disclosure — the
  // Experience section only appears once the situational context is answered.
  const contextComplete =
    !!context.situation &&
    !!(context.situation === "employed" ? context.currentRole : context.targetRole);

  return (
    <div className="min-h-screen bg-bg">
      <TopNav variant="app" user={user} />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <CompletionCard
          situation={context.situation}
          currentRole={context.currentRole || null}
          targetRole={context.targetRole || null}
        />

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
            <EditableIdentity name={user.name ?? null} githubLogin={githubLogin} />
          </div>
          <SignOutButton />
        </div>

        {/* Your sources */}
        <div className="mt-12 flex items-center justify-between gap-4">
          <p className="eyebrow">Your sources</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-btn bg-green px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark"
          >
            + New scan
          </Link>
        </div>
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
        <Card className="mt-8 scroll-mt-24 p-8" id="profile-context">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Profile context
          </h2>
          <p className="mt-1 text-ink-soft">
            Shapes every piece of content we generate for you.
          </p>
          <ProfileContextForm initial={context} />
        </Card>

        {/* Experience — appears once the context above is answered */}
        {contextComplete && (
          <Card className="mt-8 p-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              {context.situation === "student"
                ? "Any experience yet?"
                : "Did you have other experiences before?"}
            </h2>
            <p className="mt-1 text-ink-soft">
              {context.situation === "student"
                ? "Internships and freelance count — and we pre-fill from your LinkedIn / CV imports."
                : "List previous work — we also pre-fill from your LinkedIn / CV imports."}
            </p>
            {/* Key remounts the editor when the server-side list changes
                (e.g. an import or the context save seeded new cards). */}
            <ExperienceCards
              key={experiences.map((e) => e.id).join("|") || "empty"}
              initial={experiences}
            />
          </Card>
        )}

        {/* History */}
        <Card className="mt-8 p-6">
          <div className="pb-5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              History
            </h2>
            <p className="mt-1 text-ink-soft">
              Everything you&apos;ve generated, newest first.
            </p>
          </div>
          {activities.length === 0 ? (
            <p className="pb-1 text-ink-soft">Nothing yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="rounded-card border border-border bg-bg px-5"
                >
                  <ActivityRow
                    type={a.type}
                    label={a.label}
                    timestamp={a.timestamp}
                    href={a.href}
                  />
                </div>
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
