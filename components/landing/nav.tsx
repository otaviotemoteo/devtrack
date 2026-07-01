import Link from "next/link";
import { Logo } from "@/components/ui/logo";

// Landing nav: our wordmark (Logo) on the left; reference's anchor links + green
// pill "Sign in with GitHub" CTA on the right. Anchors scroll to #how / #what.
export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-lp-border bg-white/85 backdrop-blur-[10px]">
      <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-8 max-[560px]:px-5">
        <Logo href="#top" />
        <div className="flex items-center gap-[30px]">
          <a
            href="#how"
            className="nav-link text-[16px] font-semibold text-lp-ink-soft hover:text-lp-ink max-[920px]:hidden"
          >
            How it works
          </a>
          <a
            href="#what"
            className="nav-link text-[16px] font-semibold text-lp-ink-soft hover:text-lp-ink max-[920px]:hidden"
          >
            What you get
          </a>
          <Link
            href="/login"
            className="inline-flex cursor-pointer items-center gap-[10px] rounded-full border-2 border-transparent bg-lp-green px-5 py-[9px] text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(47,158,90,0.28)] [transition:transform_0.12s_ease,box-shadow_0.2s_ease,background_0.2s_ease] hover:-translate-y-px hover:bg-lp-green-dark hover:shadow-[0_10px_24px_rgba(47,158,90,0.34)]"
          >
            <svg className="h-[17px] w-[17px] shrink-0">
              <use href="#gh" />
            </svg>
            Sign in with GitHub
          </Link>
        </div>
      </div>
    </nav>
  );
}
