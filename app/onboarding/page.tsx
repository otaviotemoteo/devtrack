import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/app-header";
import { ScanForm } from "@/components/onboarding/scan-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader user={session.user} />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Let&apos;s scan your GitHub
        </h1>
        <p className="mt-2 text-ink-soft">
          Tweak a few settings, then we&apos;ll get to work.
        </p>

        <div className="mt-10">
          <ScanForm />
        </div>
      </main>
    </div>
  );
}
