import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/app-header";
import { ProgressBar } from "@/components/scan/progress-bar";
import { VideoBackground } from "@/components/ui/video-background";

export default async function ScanProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  return (
    <div className="relative flex min-h-screen flex-col bg-bg">
      <VideoBackground src="/background-3.mp4" overlayClassName="bg-bg/50" />
      <AppHeader user={session.user} />
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-card border border-border bg-bg/85 p-10 shadow-soft backdrop-blur-md">
          <ProgressBar scanId={id} />
        </div>
      </main>
    </div>
  );
}
