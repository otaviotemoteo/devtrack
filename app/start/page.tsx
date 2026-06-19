import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TopNav } from "@/components/ui/top-nav";
import { PathPicker } from "@/components/onboarding/path-picker";
import { getOrCreateProfile } from "@/lib/profile";

// First-run path picker — shown exactly once (until `onboarded`).
export default async function StartPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getOrCreateProfile(session.user.id);
  if (profile.onboarded) redirect("/");

  return (
    <div className="min-h-screen bg-bg">
      <TopNav variant="focused" />
      <PathPicker />
    </div>
  );
}
