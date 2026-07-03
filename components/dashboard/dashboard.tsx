import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ActivityRow } from "@/components/activity/activity-row";
import type { ActivityItem } from "@/lib/activity";

interface DashboardProps {
  name?: string | null;
  activities: ActivityItem[];
}

const QUICK_ACTIONS = [
  {
    glyph: "in",
    title: "Audit LinkedIn",
    subtitle: "Score your profile",
    href: "/linkedin",
  },
  { glyph: "✓", title: "Improve CV", subtitle: "Score & sharpen", href: "/cv" },
  {
    glyph: "</>",
    title: "Scan GitHub",
    subtitle: "Discover forgotten work",
    href: "/scan/new",
  },
];

export function Dashboard({ name, activities }: DashboardProps) {
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
        Welcome back, {firstName}
      </h1>
      <p className="mt-2 text-ink-soft">Jump back in, or start something new.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.title} href={a.href}>
            <Card className="flex h-full items-center gap-4 p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-btn border border-green/40 bg-green-soft font-display text-lg font-bold text-green-dark">
                {a.glyph}
              </span>
              <span>
                <span className="block font-semibold text-ink">{a.title}</span>
                <span className="block text-sm text-ink-soft">{a.subtitle}</span>
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Your activity
        </h2>
        <Link
          href="/profile"
          className="text-sm font-semibold text-green-dark transition-colors hover:text-green"
        >
          Manage sources in Profile →
        </Link>
      </div>

      <Card className="mt-4 px-6">
        {activities.length === 0 ? (
          <EmptyState />
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
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-card border-2 border-dashed border-border text-2xl text-ink-soft">
        ✦
      </span>
      <p className="font-display text-2xl font-bold text-ink">Nothing yet</p>
      <p className="text-ink-soft">Start your first scan to see results here.</p>
      <Link
        href="/start"
        className="mt-2 inline-flex items-center gap-2 rounded-btn bg-green px-6 py-3 font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark"
      >
        Start your first scan
      </Link>
    </div>
  );
}
