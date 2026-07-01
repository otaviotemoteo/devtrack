import Link from "next/link";

// Closing CTA band.
export function FinalCta() {
  return (
    <section className="sec final">
      <div className="wrap">
        <h2>Ready to make your work speak for itself?</h2>
        <Link className="btn btn-green btn-lg" href="/login">
          <svg className="gh">
            <use href="#gh" />
          </svg>
          Sign in with GitHub
        </Link>
      </div>
    </section>
  );
}
