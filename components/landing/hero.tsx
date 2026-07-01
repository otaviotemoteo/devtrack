import Link from "next/link";

// Hero (#top): headline + CTA, and the abstract commit-graph SVG art.
export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow">GitHub → Your Career</div>
          <h1>
            Your code speaks for itself.
            <br />
            <span className="accent">Your profile doesn&apos;t.</span>
          </h1>
          <p className="hero-sub">
            DevTrack reads your real commits and pull requests, then turns them
            into copy-paste-ready LinkedIn content, sharper CV bullets, and a
            profile audit — every line grounded in what you actually built.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-green btn-lg" href="/login">
              <svg className="gh">
                <use href="#gh" />
              </svg>
              Sign in with GitHub
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-art-frame">
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
              <g style={{ fontFamily: "var(--mono)" }} fontSize={10} fill="#5f6863">
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
