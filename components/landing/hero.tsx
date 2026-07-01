import Link from "next/link";

// Hero (#top): headline + CTA, and the abstract commit-graph SVG art.
export function Hero() {
  return (
    <header id="top" className="pt-20 pb-24">
      <div className="mx-auto grid max-w-[1120px] grid-cols-[1.05fr_.95fr] items-center gap-14 px-8 max-[920px]:grid-cols-1 max-[920px]:gap-10 max-[920px]:text-center max-[560px]:px-5">
        <div>
          <div className="font-lp-mono text-[12.5px] font-bold tracking-[1.8px] text-lp-green-dark uppercase">
            GitHub → Your Career
          </div>
          <h1 className="mt-5 text-[clamp(40px,5.4vw,64px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
            Your code speaks for itself.
            <br />
            <span className="text-lp-green-dark">Your profile doesn&apos;t.</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-[19.5px] leading-[1.6] text-lp-ink-soft max-[920px]:mx-auto">
            DevTrack reads your real commits and pull requests, then turns them
            into copy-paste-ready LinkedIn content, sharper CV bullets, and a
            profile audit — every line grounded in what you actually built.
          </p>
          <div className="mt-[34px] flex flex-wrap items-center gap-[18px] max-[920px]:justify-center">
            <Link
              href="/login"
              className="inline-flex cursor-pointer items-center gap-[10px] rounded-[12px] border-2 border-transparent bg-lp-green px-7 py-4 text-[18px] font-bold text-white shadow-[0_6px_18px_rgba(47,158,90,0.28)] [transition:transform_0.12s_ease,box-shadow_0.2s_ease,background_0.2s_ease] hover:-translate-y-px hover:bg-lp-green-dark hover:shadow-[0_10px_24px_rgba(47,158,90,0.34)]"
            >
              <svg className="h-[19px] w-[19px] shrink-0">
                <use href="#gh" />
              </svg>
              Sign in with GitHub
            </Link>
          </div>
        </div>
        <div className="relative max-[920px]:mx-auto max-[920px]:max-w-[460px]">
          <div className="relative overflow-hidden rounded-3xl border border-lp-border bg-lp-green-tint p-7 shadow-lp-md">
            {/* abstract commit-graph: nodes joined by lines */}
            <svg viewBox="0 0 420 320" width="100%" style={{ display: "block" }}>
              <defs>
                <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#2f9e5a" />
                  <stop offset="1" stopColor="#7fc99a" />
                </linearGradient>
              </defs>
              <g
                fill="none"
                stroke="url(#edge)"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M60 60 V260" />
                <path d="M60 110 C60 140, 160 140, 160 170 V250" />
                <path d="M160 170 C160 150, 270 150, 270 120" />
                <path d="M60 180 C60 210, 360 200, 360 230" />
                <path d="M270 120 V70" />
              </g>
              <g>
                <circle cx="60" cy="60" r="11" fill="#2f9e5a" />
                <circle cx="60" cy="110" r="8" fill="#fff" stroke="#2f9e5a" strokeWidth="3" />
                <circle cx="60" cy="180" r="8" fill="#fff" stroke="#2f9e5a" strokeWidth="3" />
                <circle cx="60" cy="260" r="11" fill="#2f9e5a" />
                <circle cx="160" cy="170" r="9" fill="#2f9e5a" />
                <circle cx="160" cy="250" r="8" fill="#fff" stroke="#2f9e5a" strokeWidth="3" />
                <circle cx="270" cy="120" r="9" fill="#2f9e5a" />
                <circle cx="270" cy="70" r="8" fill="#fff" stroke="#2f9e5a" strokeWidth="3" />
                <circle cx="360" cy="230" r="11" fill="#2f9e5a" />
              </g>
              <g style={{ fontFamily: "var(--font-lp-mono)" }} fontSize={10} fill="#5f6863">
                <text x="80" y="64">feat: payments</text>
                <text x="180" y="174">refactor: api</text>
                <text x="290" y="124">fix: auth flow</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
