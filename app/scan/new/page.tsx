import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TopNav } from "@/components/ui/top-nav";
import { BackButton } from "@/components/ui/back-button";
import { RepoPicker } from "@/components/scan/repo-picker";
import { ConnectRepos } from "@/components/scan/connect-repos";
import { hasRepoScope } from "@/lib/github/scope";

export default async function NewScanPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { type } = await searchParams;
  const generationType =
    type === "cv" || type === "linkedin_audit" ? type : "linkedin";

  // Two-tier OAuth: scanning needs repo access; run the incremental consent
  // step first if the stored grant doesn't include it.
  const hasRepo = await hasRepoScope(session.user.id);

  return (
    <div className="min-h-screen bg-bg">
      <TopNav
        variant="app"
        user={{ name: session.user.name, image: session.user.image }}
      />
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <BackButton className="-ml-2.5" />
      </div>
      {hasRepo ? (
        <RepoPicker generationType={generationType} />
      ) : (
        <ConnectRepos generationType={generationType} />
      )}
    </div>
  );
}
