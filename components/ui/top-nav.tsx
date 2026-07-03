"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/ui/logo";

type Variant = "landing" | "focused" | "app";

interface TopNavProps {
  variant?: Variant;
  user?: { name?: string | null; image?: string | null };
  /** Force the focused "WORKING…" state (e.g. while analyzing on an app page). */
  working?: boolean;
}

/**
 * One nav shell, three states. Wordmark always links home (`/`).
 * - landing: anchor links + green "Sign in with GitHub"
 * - focused: wordmark + muted "WORKING…" (used while processing and on /start)
 * - app: wordmark + username/avatar linking to /profile ("Complete your
 *   profile" pill when the session has no name yet)
 */
export function TopNav({ variant = "app", user, working = false }: TopNavProps) {
  const effective: Variant = working ? "focused" : variant;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Logo />
        {effective === "landing" && <LandingActions />}
        {effective === "focused" && (
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
            Working…
          </span>
        )}
        {effective === "app" && <AppActions user={user} />}
      </div>
    </header>
  );
}

function LandingActions() {
  return (
    <nav className="flex items-center gap-6">
      <a
        href="#how-it-works"
        className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:block"
      >
        How it works
      </a>
      <a
        href="#what-you-get"
        className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:block"
      >
        What you get
      </a>
      <button
        onClick={() => signIn("github", { callbackUrl: "/" })}
        className="inline-flex items-center gap-2 rounded-btn bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark"
      >
        <GitHubMark className="h-4 w-4" />
        Sign in with GitHub
      </button>
    </nav>
  );
}

function AppActions({
  user,
}: {
  user?: { name?: string | null; image?: string | null };
}) {
  if (!user?.name) {
    return (
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark"
      >
        <UserIcon className="h-4 w-4" />
        Complete your profile
      </Link>
    );
  }

  return (
    <Link href="/profile" className="group flex items-center gap-3">
      <span className="text-sm font-medium text-ink-soft transition-colors group-hover:text-ink">
        {user.name}
      </span>
      <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-border bg-bg-soft">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : null}
      </span>
    </Link>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" strokeLinecap="round" />
    </svg>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}
