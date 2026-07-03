"use client";

interface CompletionCardProps {
  situation: string | null;
  currentRole: string | null;
  targetRole: string | null;
}

/**
 * "Finish setting up your profile" banner pinned at the top of /profile.
 * No skip — it stays until the situational context is actually filled in
 * (situation + the field that branch cares about). Never gates anything.
 */
export function CompletionCard({
  situation,
  currentRole,
  targetRole,
}: CompletionCardProps) {
  const complete =
    !!situation && !!(situation === "employed" ? currentRole : targetRole);
  if (complete) return null;

  function goToForm() {
    document
      .getElementById("profile-context")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-dashed border-green/40 bg-green-soft/40 px-5 py-4">
      <p className="text-sm text-ink-soft">
        <span className="font-semibold text-ink">Finish setting up your profile</span>{" "}
        — answer a couple of quick questions so everything we generate fits
        your situation.
      </p>
      <button
        onClick={goToForm}
        className="shrink-0 rounded-btn bg-green px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark"
      >
        Complete now ↓
      </button>
    </div>
  );
}
