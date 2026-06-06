import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/app-header";
import { ProgressBar } from "@/components/scan/progress-bar";

export default async function ScanProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader user={session.user} />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <ProgressBar scanId={id} />
      </main>
    </div>
  );
}
