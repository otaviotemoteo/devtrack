import Link from "next/link";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { VideoBackground } from "@/components/ui/video-background";

function ArrowLeft({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GitHubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.85 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.79.62-3.38-1.37-3.38-1.37-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/onboarding");

  return (
    <main className="relative flex min-h-screen flex-col bg-bg">
      <VideoBackground src="/background-2.mp4" overlayClassName="bg-bg/55" />

      <header className="relative z-10 mx-auto flex h-20 w-full max-w-6xl items-center px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-btn px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-bg-soft hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <Logo className="mb-8" />
        <div className="w-full max-w-md rounded-card border border-border bg-bg/90 p-8 text-center shadow-soft backdrop-blur-md">
          <p className="eyebrow mb-4">welcome</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Sign in to DevTrack
          </h1>
          <p className="mt-3 text-ink-soft">
            Connect your GitHub account to scan your activity. We only read your
            commits and pull requests.
          </p>

          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/onboarding" });
            }}
          >
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-btn bg-green px-6 py-3 font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark"
            >
              <GitHubMark className="h-5 w-5" />
              Continue with GitHub
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
