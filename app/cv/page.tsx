import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CvScreen } from "@/components/cv/cv-screen";
import { getLatestEvidence } from "@/lib/run-generation";

export default async function CvPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const evidence = await getLatestEvidence(session.user.id);

  return (
    <CvScreen
      user={{ name: session.user.name, image: session.user.image }}
      hasEvidence={!!evidence}
    />
  );
}
