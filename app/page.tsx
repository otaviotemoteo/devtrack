import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LandingPage } from "@/components/landing/landing-page";
import { TopNav } from "@/components/ui/top-nav";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getOrCreateProfile } from "@/lib/profile";
import { getActivity } from "@/lib/activity";

// Home is the access gate: logged-out → landing; logged-in → onboarding gate →
// dashboard. The picker at /start runs exactly once (until `onboarded`).
export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) return <LandingPage />;

  const profile = await getOrCreateProfile(session.user.id);
  if (!profile.onboarded) redirect("/start");

  const activities = await getActivity(session.user.id);

  return (
    <div className="min-h-screen bg-bg">
      <TopNav
        variant="app"
        user={{ name: session.user.name, image: session.user.image }}
      />
      <Dashboard name={session.user.name} activities={activities} />
    </div>
  );
}
