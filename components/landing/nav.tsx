import Link from "next/link";
import { Logo } from "@/components/ui/logo";

// Landing nav: our wordmark (Logo) on the left; reference's anchor links + green
// "Sign in with GitHub" CTA on the right. Anchors scroll to #how / #what.
export function Nav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Logo href="#top" />
        <div className="nav-links">
          <a className="link" href="#how">
            How it works
          </a>
          <a className="link" href="#what">
            What you get
          </a>
          <Link className="btn btn-green" href="/login">
            <svg className="gh">
              <use href="#gh" />
            </svg>
            Sign in with GitHub
          </Link>
        </div>
      </div>
    </nav>
  );
}
