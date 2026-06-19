import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LinkedinImportScreen } from "@/components/linkedin/linkedin-import-screen";
import { getLatestEvidenceScan } from "@/lib/run-generation";

export default async function LinkedinPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const scan = await getLatestEvidenceScan(session.user.id);

  return (
    <LinkedinImportScreen
      user={{ name: session.user.name, image: session.user.image }}
      hasEvidence={!!scan}
    />
  );
}
