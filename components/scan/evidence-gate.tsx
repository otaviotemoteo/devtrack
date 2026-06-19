import Link from "next/link";

/** Shown on CV/LinkedIn screens when the user has no scan evidence yet. */
export function EvidenceGate({ what }: { what: string }) {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-card border border-border bg-bg-soft p-8 text-center">
      <p className="font-display text-xl font-bold text-ink">
        Run a GitHub scan first
      </p>
      <p className="mt-2 text-ink-soft">
        {what} cross-references your real GitHub work. Run a scan to generate that
        evidence, then come back.
      </p>
      <Link
        href="/scan/new"
        className="mt-6 inline-flex items-center justify-center rounded-btn bg-green px-6 py-3 font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-dark"
      >
        Start a scan
      </Link>
    </div>
  );
}
