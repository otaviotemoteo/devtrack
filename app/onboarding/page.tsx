import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/ui/top-nav";
import { ScanForm } from "@/components/onboarding/scan-form";
import { VideoBackground } from "@/components/ui/video-background";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="relative min-h-screen bg-bg">
      <VideoBackground
        src="/background-1.mp4"
        overlayClassName="bg-gradient-to-b from-bg/85 via-bg/65 to-bg/80"
      />
      <TopNav
        variant="app"
        user={{ name: session.user.name, image: session.user.image }}
      />
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
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
