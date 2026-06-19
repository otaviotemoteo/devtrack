import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TopNav } from "@/components/ui/top-nav";
import { RepoPicker } from "@/components/scan/repo-picker";

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

  return (
    <div className="min-h-screen bg-bg">
      <TopNav
        variant="app"
        user={{ name: session.user.name, image: session.user.image }}
      />
      <RepoPicker generationType={generationType} />
    </div>
  );
}
